import React, { useEffect, useState, useRef } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { sections, labels, readiness } from "./domain.mjs";

async function api(path, method = "GET", body) {
  const response = await fetch("/api/v1" + path, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Le service est indisponible. Réessayez plus tard.");
  }
  if (!response.ok) {
    const error = new Error(data.error || "Une erreur est survenue.");
    error.status = response.status;
    throw error;
  }
  return data;
}
function Field({ label, value, onChange, multiline = false, ...props }) {
  const field = React.useId();
  return (
    <VStack gap={1}>
      <label htmlFor={field}>{label}</label>
      {multiline ? (
        <textarea
          id={field}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          {...props}
        />
      ) : (
        <input
          id={field}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
        />
      )}
    </VStack>
  );
}
const getForm = (e) => Object.fromEntries(new FormData(e.currentTarget));
export default function Live({ route, ui }) {
  const { Logo, Action, Proposal, Pill } = ui;
  const [config, setConfig] = useState(null),
    [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const [page, setPage] = useState("dossiers"),
    [dossiers, setDossiers] = useState([]),
    [docs, setDocs] = useState([]),
    [invitations, setInvitations] = useState([]),
    [selected, setSelected] = useState(null),
    [client, setClient] = useState(null),
    [adminData, setAdminData] = useState(null);
  const lock = useRef(false);
  const draftDirty = useRef(false);
  async function refresh() {
    const [u, d, r, i] = await Promise.all([
      api("/me"),
      api("/dossiers"),
      api("/documents"),
      api("/invitations"),
    ]);
    setUser(u);
    setDossiers(d);
    setDocs(r);
    setInvitations(i);
    return u;
  }
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const c = await api("/config");
        if (!alive) return;
        setConfig(c);
        if (route === "#/client") {
          setClient(await api("/client"));
        } else if (route === "#/espace") {
          await refresh();
        }
      } catch (e) {
        if (alive && e.status !== 401) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [route]);
  async function perform(fn, message = "") {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      if (message) setNotice(message);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const goPage = (key) => {
    if (
      draftDirty.current &&
      !window.confirm("Quitter sans enregistrer les modifications du dossier ?")
    )
      return;
    draftDirty.current = false;
    setPage(key);
    setSelected(null);
    setNotice("");
    setError("");
  };
  async function logout() {
    await api("/auth/logout", "POST", {});
    setUser(null);
    setClient(null);
    location.hash = "#/demarrage";
  }
  const top = (
    <HStack padding={5} gap={5} justify="between" wrap="wrap">
      <Logo />
      <HStack gap={3} wrap="wrap">
        <a href="#/aide">Aide</a>
        <a href="#/demo">Démo fictive</a>
        {user || client ? (
          <Action onClick={() => perform(logout)} isDisabled={busy}>
            Se déconnecter
          </Action>
        ) : (
          <a href="#/">Accueil</a>
        )}
      </HStack>
    </HStack>
  );
  if (loading)
    return (
      <AppShell
        className="live-app"
        mobileNav={false}
        topNav={top}
        height="auto"
        contentPadding={6}
      >
        <p role="status">Ouverture de votre espace…</p>
      </AppShell>
    );
  const token = route.startsWith("#/connexion/") ? route.split("/")[2] : null;
  const invitation = route.startsWith("#/invitation/")
    ? route.split("/")[2]
    : null;
  const needsLogin = !user && route !== "#/client";
  if (token || invitation || needsLogin)
    return (
      <AppShell
        className="live-app"
        mobileNav={false}
        topNav={top}
        height="auto"
        contentPadding={6}
      >
        <VStack maxWidth={600} gap={5} padding={5}>
          <p className="eyebrow">VOTRE ESPACE SESTET</p>
          <h1>
            {token
              ? "Confirmer mon accès"
              : invitation
                ? "Une proposition vous attend."
                : "Vos prochaines missions commencent ici."}
          </h1>
          {error && (
            <p className="warning" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          {config?.testMail && (
            <p className="warning">
              Environnement de test local. Utilisez uniquement une adresse
              fictive terminant par .test. Les emails sont interceptés
              localement et ne sont pas envoyés.{" "}
              <a
                href="http://127.0.0.1:4181/_test-mailbox"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir les emails fictifs
              </a>
            </p>
          )}
          {token ? (
            <>
              <p>
                Confirmez l’ouverture de la session sur cet appareil. Ce lien ne
                pourra plus être réutilisé.
              </p>
              <Action
                primary
                isDisabled={busy}
                onClick={() =>
                  perform(async () => {
                    const r = await api("/auth/verify", "POST", { token });
                    location.replace(
                      r.role === "client" ? "#/client" : "#/espace",
                    );
                  })
                }
              >
                Ouvrir ma session
              </Action>
              <a href="#/demarrage">Demander un nouveau lien</a>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = getForm(e);
                perform(
                  () =>
                    api("/auth/request", "POST", {
                      email: data.email,
                      ...(invitation ? { invitation } : {}),
                    }),
                  "Si l’adresse est autorisée, le lien de connexion vous sera envoyé.",
                );
              }}
            >
              <VStack gap={4}>
                <label htmlFor="login-email">
                  {invitation ? "Adresse email invitée" : "Votre adresse email"}
                </label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
                <Action
                  primary
                  type="submit"
                  isDisabled={busy || !config?.email}
                >
                  Recevoir mon lien de connexion
                </Action>
                <p className="caption">
                  Sans mot de passe. Le lien vérifie votre adresse et expire
                  après 15 minutes. Pour récupérer votre accès, demandez
                  simplement un nouveau lien.
                </p>
                {!config?.email && (
                  <p>
                    La connexion n’est pas encore configurée.{" "}
                    <a href="#/demo">Explorer la démo</a>
                  </p>
                )}
              </VStack>
            </form>
          )}
        </VStack>
      </AppShell>
    );
  if (route === "#/client")
    return (
      <AppShell
        className="live-app"
        mobileNav={false}
        topNav={top}
        height="auto"
        contentPadding={6}
      >
        <VStack maxWidth={1000} gap={5}>
          <h1>Votre proposition de mission</h1>
          {error && (
            <p className="warning" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          {client ? (
            <>
              <Pill status={client.status} />
              <Proposal version={client} />
              <Action onClick={() => window.print()}>
                Imprimer / enregistrer en PDF
              </Action>
              <ClientResponse
                client={client}
                Action={Action}
                busy={busy}
                submit={(data) =>
                  perform(async () => {
                    setClient(await api("/client/respond", "POST", data));
                  }, "Votre réponse est enregistrée sur cette version.")
                }
              />
            </>
          ) : (
            <p>
              L’accès est indisponible. Rouvrez votre invitation ou demandez au
              consultant de la renouveler.
            </p>
          )}
        </VStack>
      </AppShell>
    );
  return (
    <AppShell
      className="live-app"
      mobileNav={false}
      topNav={top}
      height="auto"
      contentPadding={6}
    >
      <VStack gap={6}>
        <HStack gap={3} wrap="wrap" as="nav" aria-label="Bureau du consultant">
          {[
            ["dossiers", "Mes dossiers"],
            ["bibliotheque", "Ma bibliothèque"],
            ["profil", "Mon activité"],
            ["abonnement", "Abonnement & aide"],
            ...(user?.admin ? [["admin", "Administration"]] : []),
          ].map(([key, title]) => (
            <Action
              key={key}
              primary={page === key}
              onClick={() =>
                perform(async () => {
                  if (key === "admin") setAdminData(await api("/admin"));
                  goPage(key);
                })
              }
            >
              {title}
            </Action>
          ))}
        </HStack>
        {error && (
          <p role="alert" className="warning">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="notice">
            {notice}
          </p>
        )}
        {selected ? (
          <Dossier
            key={selected.id}
            initial={selected}
            ui={ui}
            docs={docs}
            invitations={invitations.filter((i) => i.dossier === selected.id)}
            config={config}
            busy={busy}
            perform={perform}
            refresh={refresh}
            onBack={() => setSelected(null)}
            onDirty={(value) => {
              draftDirty.current = value;
            }}
            onSelect={setSelected}
          />
        ) : page === "dossiers" ? (
          <VStack gap={5} maxWidth={1100}>
            <h1>
              {user.profile.name
                ? `Bonjour ${user.profile.name.split(" ")[0]}.`
                : "Bienvenue dans votre espace."}
            </h1>
            <p className="lead">
              Retrouvez vos propositions et la prochaine action à mener.
            </p>
            {!user.profile.name && (
              <p className="plain-note">
                Commencez par{" "}
                <button onClick={() => goPage("profil")}>
                  renseigner votre activité
                </button>
                , puis ajoutez les références que vous pouvez réutiliser.
              </p>
            )}
            {dossiers.length ? (
              dossiers.map((d) => {
                const v = d.versions.at(-1);
                return (
                  <HStack
                    key={d.id}
                    gap={5}
                    wrap="wrap"
                    justify="between"
                    as="section"
                  >
                    <VStack gap={1}>
                      <h2>{d.client}</h2>
                      <p>
                        {d.title} · version {v.number}
                      </p>
                      <p className="caption">
                        {v.status === "shared"
                          ? "En attente du client"
                          : v.status === "changes_requested"
                            ? "À vous : préparer une nouvelle version"
                            : v.status === "approved"
                              ? "Accord reçu : conservez le document"
                              : "À vous : compléter et relire la proposition"}
                      </p>
                    </VStack>
                    <Pill status={v.status} />
                    <Action onClick={() => setSelected(d)}>
                      Ouvrir le dossier
                    </Action>
                  </HStack>
                );
              })
            ) : (
              <p>
                Aucun dossier pour le moment. Ajoutez votre premier brief
                ci-dessous.
              </p>
            )}
            <NewDossier
              docs={docs}
              Action={Action}
              busy={busy}
              submit={(data) =>
                perform(async () => {
                  const d = await api("/dossiers", "POST", data);
                  await refresh();
                  setSelected(d);
                })
              }
            />
          </VStack>
        ) : page === "bibliotheque" ? (
          <Library
            docs={docs}
            Action={Action}
            busy={busy}
            perform={perform}
            refresh={refresh}
          />
        ) : page === "profil" ? (
          <Profile
            user={user}
            Action={Action}
            busy={busy}
            submit={(profile) =>
              perform(async () => {
                await api("/profile", "PUT", profile);
                await refresh();
              }, "Votre activité est enregistrée.")
            }
          />
        ) : page === "abonnement" ? (
          <VStack gap={5} maxWidth={700}>
            <h1>Abonnement & aide</h1>
            <p>
              Offre envisagée : 49 USD par mois, dix nouvelles préparations,
              trois corrections IA par dossier et par période. Les éditions
              manuelles ne consomment aucun quota.
            </p>
            <p>
              <strong>Mode test uniquement.</strong> Aucun encaissement réel
              n’est activé.
            </p>
            <p>
              Statut : {user.billing.status} · {user.billing.used} /{" "}
              {user.billing.limit} préparations sur la période.
            </p>
            <HStack gap={3} wrap="wrap">
              <Action
                primary
                isDisabled={busy || !config?.billing}
                onClick={() =>
                  perform(async () => {
                    const r = await api("/billing/checkout", "POST", {});
                    location.assign(r.url);
                  })
                }
              >
                Tester la souscription
              </Action>
              <Action
                isDisabled={busy || !config?.billing}
                onClick={() =>
                  perform(async () => {
                    const r = await api("/billing/portal", "POST", {});
                    location.assign(r.url);
                  })
                }
              >
                Gérer / annuler l’abonnement test
              </Action>
            </HStack>
            {!config?.billing && (
              <p>La connexion au paiement test reste à configurer.</p>
            )}
            <p>
              Les honoraires de vos missions restent payés directement par vos
              clients. Sestet ne les encaisse pas.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = getForm(e);
                perform(
                  () => api("/support", "POST", data),
                  "Votre demande est enregistrée pour l’opératrice.",
                );
              }}
            >
              <VStack gap={3}>
                <label htmlFor="support-message">Contacter le support</label>
                <textarea
                  id="support-message"
                  name="text"
                  required
                  maxLength={2000}
                />
                <p className="caption">
                  Décrivez le problème sans copier de contenu confidentiel. La
                  demande est consultable par Emma dans l’administration.
                </p>
                <Action type="submit" isDisabled={busy}>
                  Enregistrer ma demande
                </Action>
              </VStack>
            </form>
            <details>
              <summary>Supprimer mon espace et ses documents</summary>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = getForm(e);
                  if (
                    window.confirm(
                      "Supprimer définitivement cet espace, ses références et ses dossiers ?",
                    )
                  )
                    perform(async () => {
                      await api("/account", "DELETE", data);
                      setUser(null);
                      location.hash = "#/demarrage";
                    });
                }}
              >
                <label htmlFor="delete-email">
                  Saisissez votre adresse email pour confirmer
                </label>
                <input type="email" id="delete-email" name="confirm" required />
                <Action type="submit" isDisabled={busy}>
                  Supprimer mon espace
                </Action>
              </form>
            </details>
          </VStack>
        ) : page === "admin" && adminData ? (
          <VStack gap={5}>
            <h1>Administration Sestet</h1>
            <p>
              Activité réelle de cet environnement. Aucun document client n’est
              accessible ici.
            </p>
            <h2>Comptes</h2>
            {adminData.users.length ? (
              adminData.users.map((u) => (
                <p key={u.id}>
                  {u.email} · {u.billing_status} · créé le{" "}
                  {new Date(u.created).toLocaleDateString("fr")}
                </p>
              ))
            ) : (
              <p>Aucun compte.</p>
            )}
            <h2>Activation</h2>
            {adminData.events.length ? (
              adminData.events.map((e) => (
                <p key={e.type}>
                  {e.type} : {e.count}
                </p>
              ))
            ) : (
              <p>Aucun événement.</p>
            )}
            <h2>Préparations IA</h2>
            {adminData.generations.length ? (
              adminData.generations.map((g, i) => (
                <p key={i}>
                  {g.status} · {g.kind} · {g.input_tokens} tokens entrants /{" "}
                  {g.output_tokens} sortants · {g.model || "—"}
                  {g.error ? ` · erreur ${g.error}` : ""}
                </p>
              ))
            ) : (
              <p>Aucune préparation. Aucun coût observé.</p>
            )}
            <h2>Support</h2>
            {adminData.support.length ? (
              adminData.support.map((s) => (
                <blockquote key={s.id}>
                  <strong>{s.email}</strong>
                  <p>{s.text}</p>
                </blockquote>
              ))
            ) : (
              <p>Aucune demande.</p>
            )}
          </VStack>
        ) : null}
      </VStack>
    </AppShell>
  );
}
function NewDossier({ docs, Action, busy, submit }) {
  return (
    <details open>
      <summary>Préparer une nouvelle mission</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          submit({
            ...Object.fromEntries(form),
            sourceIds: form.getAll("sourceIds"),
          });
        }}
      >
        <VStack gap={4} maxWidth={750} padding={4}>
          <label htmlFor="new-client">Nom du client</label>
          <input id="new-client" name="client" required maxLength={200} />
          <label htmlFor="new-title">Titre de la mission</label>
          <input id="new-title" name="title" required maxLength={200} />
          <label htmlFor="new-brief">Contexte et brief</label>
          <textarea
            id="new-brief"
            name="brief"
            required
            rows={5}
            maxLength={20000}
          />
          <fieldset>
            <legend>
              Références autorisées pour ce dossier · cinq maximum
            </legend>
            {docs.length ? (
              docs.map((d) => (
                <label className="checkbox" key={d.id}>
                  <input name="sourceIds" type="checkbox" value={d.id} />
                  {d.title}
                </label>
              ))
            ) : (
              <p>
                Aucune référence. Vous pouvez commencer manuellement ou enrichir
                votre bibliothèque.
              </p>
            )}
          </fieldset>
          <Action primary type="submit" isDisabled={busy}>
            Créer le dossier
          </Action>
        </VStack>
      </form>
    </details>
  );
}
function Library({ docs, Action, busy, perform, refresh }) {
  const [title, setTitle] = useState(""),
    [content, setContent] = useState(""),
    [authorized, setAuthorized] = useState(false),
    [fileError, setFileError] = useState(""),
    [reading, setReading] = useState(false);
  async function readFile(file) {
    if (!file) return;
    setFileError("");
    setReading(true);
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Limite : 5 Mo par fichier.");
      let value;
      if (file.name.toLowerCase().endsWith(".txt")) value = await file.text();
      else if (file.name.toLowerCase().endsWith(".pdf")) {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
        const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const task = pdfjs.getDocument({
          data: new Uint8Array(await file.arrayBuffer()),
          isEvalSupported: false,
        });
        const pdf = await task.promise;
        try {
          if (pdf.numPages > 40) throw new Error("Limite : 40 pages par PDF.");
          const pages = [];
          for (let n = 1; n <= pdf.numPages; n++) {
            const page = await pdf.getPage(n);
            const text = await page.getTextContent();
            pages.push(text.items.map((i) => i.str || "").join(" "));
          }
          value = pages.join("\n\n");
        } finally {
          await task.destroy();
        }
      } else throw new Error("Formats acceptés : TXT ou PDF textuel.");
      if (value.trim().length < 20)
        throw new Error(
          "Aucun texte exploitable. Un PDF scanné nécessite un OCR préalable.",
        );
      if (value.length > 50000)
        throw new Error(
          "Limite : 50 000 caractères par référence. Séparez le document.",
        );
      setTitle(file.name.replace(/\.[^.]+$/, ""));
      setContent(value);
      setAuthorized(false);
    } catch (e) {
      setFileError(e.message);
    } finally {
      setReading(false);
    }
  }
  return (
    <VStack gap={5} maxWidth={850}>
      <h1>Votre bibliothèque privée.</h1>
      <p>
        Importez uniquement les contenus dont vous autorisez la réutilisation.
        Pour chaque dossier, vous choisirez les références à consulter.
      </p>
      {docs.map((d) => (
        <details key={d.id}>
          <summary>{d.title}</summary>
          <p>{d.text}</p>
          <Action
            isDisabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  "Supprimer cette référence ? Les extraits déjà conservés dans vos propositions restent dans leur historique.",
                )
              )
                perform(async () => {
                  await api("/documents/" + d.id, "DELETE", {});
                  await refresh();
                }, "Référence supprimée.");
            }}
          >
            Supprimer la référence
          </Action>
        </details>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          perform(async () => {
            await api("/documents", "POST", {
              title,
              text: content,
              authorized,
            });
            setTitle("");
            setContent("");
            setAuthorized(false);
            await refresh();
          }, "Référence enregistrée dans votre bibliothèque privée.");
        }}
      >
        <VStack gap={4}>
          <h2>Ajouter une référence</h2>
          <label htmlFor="reference-file">
            Importer un TXT ou un PDF textuel
          </label>
          <input
            id="reference-file"
            type="file"
            accept=".txt,.pdf"
            disabled={reading}
            onChange={(e) => readFile(e.target.files[0])}
          />
          <p className="caption">
            5 Mo · 40 pages · 50 000 caractères. Le texte extrait est enregistré
            ; le fichier original n’est pas conservé. Les scans sans texte
            nécessitent un OCR.
          </p>
          {reading && <p role="status">Lecture du document…</p>}
          {fileError && (
            <p className="warning" role="alert">
              {fileError}
            </p>
          )}
          <Field
            label="Titre de la référence"
            value={title}
            onChange={setTitle}
            required
            maxLength={200}
          />
          <Field
            label="Texte à réutiliser — coller ou corriger ici"
            value={content}
            onChange={setContent}
            multiline
            required
            minLength={20}
            maxLength={50000}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              required
            />
            Je suis autorisé à réutiliser ce contenu et j’ai retiré les
            informations confidentielles inutiles.
          </label>
          <Action primary type="submit" isDisabled={busy || reading}>
            Enregistrer la référence
          </Action>
        </VStack>
      </form>
    </VStack>
  );
}
function Profile({ user, Action, busy, submit }) {
  const [profile, setProfile] = useState({
      name: "",
      activity: "",
      contact: "",
      services: "",
      pricing: "",
      logo: "",
      ...user.profile,
    }),
    [error, setError] = useState("");
  return (
    <VStack maxWidth={700} gap={5}>
      <h1>Votre activité.</h1>
      <p>
        Ces informations servent à préparer vos nouveaux dossiers. Vous
        confirmez les conditions de chaque mission séparément.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(profile);
        }}
      >
        <VStack gap={4}>
          {[
            ["name", "Nom professionnel"],
            ["activity", "Spécialité et types de missions"],
            ["contact", "Coordonnées à afficher au client"],
            ["services", "Prestations proposées"],
            ["pricing", "Repères tarifaires privés"],
          ].map(([k, label]) => (
            <Field
              key={k}
              label={label}
              value={profile[k]}
              onChange={(v) => setProfile((p) => ({ ...p, [k]: v }))}
              multiline={["services", "pricing"].includes(k)}
              required={k === "name"}
            />
          ))}
          <label htmlFor="profile-logo">
            Logo · PNG, JPEG ou WebP · 70 Ko maximum
          </label>
          <input
            id="profile-logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files[0];
              if (!f) return;
              if (
                f.size > 70000 ||
                !["image/png", "image/jpeg", "image/webp"].includes(f.type)
              ) {
                setError(
                  "Choisissez une image PNG, JPEG ou WebP de moins de 70 Ko.",
                );
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                setProfile((p) => ({ ...p, logo: reader.result }));
                setError("");
              };
              reader.readAsDataURL(f);
            }}
          />
          {error && <p role="alert">{error}</p>}
          {profile.logo && (
            <img src={profile.logo} alt="Votre logo" width="100" />
          )}
          <Action primary type="submit" isDisabled={busy}>
            Enregistrer mon activité
          </Action>
        </VStack>
      </form>
    </VStack>
  );
}
function Dossier({
  initial,
  ui,
  docs,
  invitations,
  config,
  busy,
  perform,
  refresh,
  onBack,
  onSelect,
  onDirty,
}) {
  const { Action, Proposal, Pill } = ui;
  const [d, setD] = useState(initial),
    [index, setIndex] = useState(initial.versions.length - 1),
    [preview, setPreview] = useState(false),
    [dirty, setDirty] = useState(false),
    [email, setEmail] = useState("");
  const saved = useRef(initial);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty]);
  const v = d.versions[index],
    editable = ["draft", "ready"].includes(v.status);
  useEffect(() => {
    const warn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change(fn) {
    setD((old) => ({
      ...old,
      versions: old.versions.map((version, i) =>
        i === index ? fn(version) : version,
      ),
    }));
    setDirty(true);
  }
  async function save() {
    const next = await api(`/dossiers/${d.id}/save`, "POST", {
      versionId: v.id,
      revision: d.revision,
      content: v.content,
      priceConfirmed: v.priceConfirmed,
      timelineConfirmed: v.timelineConfirmed,
      privateNotes: d.privateNotes,
    });
    setD(next);
    saved.current = next;
    setDirty(false);
    await refresh();
    return next;
  }
  async function action(name, extra = {}) {
    const next = await api(`/dossiers/${d.id}/${name}`, "POST", {
      versionId: v.id,
      revision: d.revision,
      ...extra,
    });
    setD(next);
    saved.current = next;
    setDirty(false);
    await refresh();
    return next;
  }
  return (
    <VStack gap={5}>
      <HStack gap={3} wrap="wrap" justify="between">
        <Action
          onClick={() => {
            if (
              !dirty ||
              window.confirm(
                "Quitter sans enregistrer les dernières modifications ?",
              )
            )
              onBack();
          }}
        >
          ← Mes dossiers
        </Action>
        <Pill status={v.status} />
      </HStack>
      <h1>
        {d.client} · {d.title}
      </h1>
      <HStack gap={3} wrap="wrap">
        <label htmlFor="version-select">Version</label>
        <select
          id="version-select"
          value={index}
          onChange={(e) => {
            if (
              !dirty ||
              window.confirm("Changer de version sans enregistrer ?")
            ) {
              setIndex(Number(e.target.value));
              setD(saved.current);
              setDirty(false);
            }
          }}
        >
          {d.versions.map((version, i) => (
            <option key={version.id} value={i}>
              Version {version.number} — {labels[version.status]}
            </option>
          ))}
        </select>
        <Action onClick={() => setPreview(!preview)}>
          {preview ? "Revenir à l’édition" : "Prévisualiser le document client"}
        </Action>
        <Action
          isDisabled={busy || dirty}
          onClick={() =>
            perform(async () => {
              const next = await action("duplicate");
              onSelect(next);
            }, "Copie créée sans les accords précédents.")
          }
        >
          Dupliquer
        </Action>
      </HStack>
      <details>
        <summary>Brief et références sélectionnées</summary>
        <p>{d.brief}</p>
        {d.sourceIds.length ? (
          d.sourceIds.map((id) => (
            <p key={id}>
              {docs.find((s) => s.id === id)?.title || "Référence supprimée"}
            </p>
          ))
        ) : (
          <p>Aucune référence sélectionnée.</p>
        )}
      </details>
      {preview ? (
        <>
          <Proposal version={v} />
          <Action onClick={() => window.print()}>
            Imprimer / enregistrer en PDF
          </Action>
        </>
      ) : (
        <VStack gap={5} maxWidth={900}>
          {sections.map(([key, label]) => (
            <VStack key={key} gap={2}>
              <Field
                label={label}
                value={v.content[key]}
                readOnly={!editable || busy}
                multiline
                maxLength={15000}
                onChange={(value) =>
                  change((current) => ({
                    ...current,
                    content: { ...current.content, [key]: value },
                    ...(["price", "timeline"].includes(key)
                      ? { [key + "Confirmed"]: false }
                      : {}),
                  }))
                }
              />
              {["price", "timeline"].includes(key) && (
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={v[key + "Confirmed"]}
                    disabled={!editable || busy}
                    onChange={(e) =>
                      change((current) => ({
                        ...current,
                        [key + "Confirmed"]: e.target.checked,
                      }))
                    }
                  />
                  Je confirme{" "}
                  {key === "price"
                    ? "ce prix et ces modalités"
                    : "ce calendrier"}
                  .
                </label>
              )}
            </VStack>
          ))}
          <Field
            label="Notes privées — jamais partagées"
            value={d.privateNotes}
            readOnly={!editable || busy}
            multiline
            onChange={(value) => {
              setD({ ...d, privateNotes: value });
              setDirty(true);
            }}
          />
          {v.evidence.length > 0 && (
            <details>
              <summary>Sources des formulations proposées · privées</summary>
              {v.evidence.map((e, i) => (
                <blockquote key={i}>
                  <strong>
                    {e.kind} · {sections.find(([k]) => k === e.field)?.[1]}
                  </strong>
                  <p>« {e.quote} »</p>
                  <small>
                    {e.sourceId === "brief"
                      ? "Brief du dossier"
                      : docs.find((s) => s.id === e.sourceId)?.title ||
                        "Référence supprimée"}
                  </small>
                </blockquote>
              ))}
            </details>
          )}
        </VStack>
      )}
      {editable ? (
        <>
          <HStack gap={3} wrap="wrap">
            <Action
              primary
              isDisabled={busy}
              onClick={() =>
                perform(save, "Proposition enregistrée sur le serveur.")
              }
            >
              Enregistrer la proposition
            </Action>
            <Action
              isDisabled={busy || !config?.ai}
              onClick={() =>
                perform(async () => {
                  const current = dirty ? await save() : d;
                  const next = await api(`/dossiers/${d.id}/generate`, "POST", {
                    id: crypto.randomUUID(),
                    versionId: v.id,
                    revision: current.revision,
                  });
                  setD(next);
                  saved.current = next;
                  setDirty(false);
                  await refresh();
                }, "Formulations préparées. Relisez chaque section et ses sources avant tout engagement.")
              }
            >
              Préparer avec mes sources
            </Action>
          </HStack>
          <p className="caption">
            {dirty ? "Modifications non enregistrées." : "Version enregistrée."}{" "}
            {config?.ai
              ? "La préparation IA remplace les formulations du brouillon ; prix et calendrier sont conservés."
              : "La préparation IA reste à configurer. Vous pouvez rédiger et enregistrer manuellement."}
          </p>
          {readiness(v).length > 0 ? (
            <p className="warning">
              À compléter avant partage : {readiness(v).join(" · ")}.
            </p>
          ) : preview ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                perform(async () => {
                  const current = dirty ? await save() : d;
                  const r = await api(`/dossiers/${d.id}/share`, "POST", {
                    versionId: v.id,
                    revision: current.revision,
                    email,
                  });
                  setD(r.dossier);
                  saved.current = r.dossier;
                  setDirty(false);
                  await refresh();
                  if (r.delivery !== "sent")
                    throw new Error(
                      "La version est figée et l’invitation créée, mais l’email a échoué. Utilisez « Renvoyer » ci-dessous.",
                    );
                }, "Version partagée. Le destinataire doit vérifier son adresse pour la consulter.");
              }}
            >
              <VStack gap={3} maxWidth={600}>
                <Field
                  label="Adresse du client invité"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                />
                <p>
                  L’invitation donne accès à cette version pendant sept jours.
                  Elle peut être révoquée à tout moment.
                </p>
                <Action primary type="submit" isDisabled={busy}>
                  Partager cette version et envoyer l’invitation
                </Action>
              </VStack>
            </form>
          ) : (
            <p>
              Ouvrez l’aperçu client pour relire le document avant de le
              partager.
            </p>
          )}
        </>
      ) : (
        v.status !== "superseded" && (
          <Action
            primary
            isDisabled={busy}
            onClick={() =>
              perform(async () => {
                const next = await action("revise");
                setIndex(next.versions.length - 1);
                setPreview(false);
              }, "Nouvelle version créée. Un nouvel accord sera nécessaire.")
            }
          >
            Créer une nouvelle version
          </Action>
        )
      )}
      <VStack gap={3}>
        <h2>Réponses sur la version {v.number}</h2>
        {v.responses.length ? (
          v.responses.map((r, i) => (
            <blockquote key={i}>
              <strong>
                {r.type === "approval"
                  ? "Accord"
                  : r.type === "changes"
                    ? "Modification demandée"
                    : "Question"}{" "}
                ·{" "}
                {r.provenance === "client"
                  ? "client vérifié"
                  : "retranscrit par le consultant"}
              </strong>
              <p>{r.text}</p>
              <small>{new Date(r.at).toLocaleString("fr")}</small>
            </blockquote>
          ))
        ) : (
          <p>Aucune réponse. Le silence ne vaut pas accord.</p>
        )}
        {["shared", "changes_requested"].includes(v.status) && (
          <details>
            <summary>Retranscrire une réponse reçue ailleurs</summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                perform(
                  () => action("transcribe", getForm(e)),
                  "Réponse conservée avec sa provenance.",
                );
              }}
            >
              <VStack gap={3}>
                <label htmlFor="transcribed-type">Type de réponse</label>
                <select name="type" id="transcribed-type">
                  <option value="question">Question</option>
                  <option value="changes">Modification demandée</option>
                  <option value="approval">Accord retranscrit</option>
                </select>
                <label htmlFor="transcribed-text">
                  Réponse et canal d’origine
                </label>
                <textarea
                  name="text"
                  id="transcribed-text"
                  required
                  maxLength={2000}
                />
                <Action type="submit" isDisabled={busy}>
                  Enregistrer la transcription
                </Action>
              </VStack>
            </form>
          </details>
        )}
      </VStack>
      <VStack gap={3}>
        <h2>Accès invités</h2>
        {invitations.length ? (
          invitations.map((i) => (
            <HStack key={i.id} gap={3} wrap="wrap">
              <p>
                {i.email} ·{" "}
                {i.revoked
                  ? "révoqué"
                  : i.expires < Date.now()
                    ? "expiré"
                    : "actif"}
              </p>
              {!i.revoked && (
                <>
                  <Action
                    isDisabled={busy}
                    onClick={() =>
                      perform(async () => {
                        await api(`/invitations/${i.id}/revoke`, "POST", {});
                        await refresh();
                      }, "Accès révoqué, y compris les sessions déjà ouvertes.")
                    }
                  >
                    Révoquer
                  </Action>
                  <Action
                    isDisabled={busy || i.expires < Date.now()}
                    onClick={() =>
                      perform(
                        () => api(`/invitations/${i.id}/resend`, "POST", {}),
                        "Invitation renvoyée.",
                      )
                    }
                  >
                    Renvoyer
                  </Action>
                </>
              )}
            </HStack>
          ))
        ) : (
          <p>Aucun accès client.</p>
        )}
      </VStack>
      <details>
        <summary>Supprimer ce dossier</summary>
        <Action
          isDisabled={busy}
          onClick={() => {
            if (
              window.confirm(
                "Supprimer définitivement ce dossier, ses versions et ses invitations ?",
              )
            )
              perform(async () => {
                await api("/dossiers/" + d.id, "DELETE", {});
                await refresh();
                onBack();
              }, "Dossier supprimé.");
          }}
        >
          Confirmer la suppression du dossier
        </Action>
      </details>
    </VStack>
  );
}
function ClientResponse({ client, Action, busy, submit }) {
  const [type, setType] = useState("question"),
    [text, setText] = useState(""),
    [consent, setConsent] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  return (
    <VStack gap={4} maxWidth={700}>
      <h2>Votre réponse · version {client.number}</h2>
      {["shared", "changes_requested"].includes(client.status) ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit({ id: requestId.current, type, text, consent });
          }}
        >
          <VStack gap={3}>
            <label htmlFor="client-type">Votre choix</label>
            <select
              id="client-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setConsent(false);
                requestId.current = crypto.randomUUID();
              }}
            >
              <option value="question">Poser une question</option>
              <option value="changes">Demander une modification</option>
              <option value="approval">Donner mon accord</option>
            </select>
            {type === "approval" ? (
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={consent}
                  required
                  onChange={(e) => setConsent(e.target.checked)}
                />
                J’ai relu et j’approuve explicitement le périmètre, le prix et
                le calendrier de la version {client.number}.
              </label>
            ) : (
              <Field
                label="Votre message"
                value={text}
                onChange={(value) => {
                  setText(value);
                  requestId.current = crypto.randomUUID();
                }}
                multiline
                required
                maxLength={2000}
              />
            )}
            <Action primary type="submit" isDisabled={busy}>
              Enregistrer ma réponse
            </Action>
            <p className="caption">
              Votre réponse concerne cette version uniquement. Ce parcours ne
              constitue pas une signature électronique certifiée.
            </p>
          </VStack>
        </form>
      ) : (
        <p>
          {client.status === "approved"
            ? "Votre accord est enregistré."
            : "Cette version a été remplacée. Demandez la nouvelle version au consultant."}
        </p>
      )}
      {client.responses.map((r, i) => (
        <blockquote key={i}>
          <strong>
            {r.provenance === "client"
              ? "Réponse du client vérifié"
              : "Réponse retranscrite par le consultant"}
          </strong>
          <p>{r.text}</p>
        </blockquote>
      ))}
    </VStack>
  );
}
