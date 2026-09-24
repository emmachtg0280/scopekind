import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@astryxdesign/core/Button";
import { Theme } from "@astryxdesign/core/theme";
import { sestetTheme } from "./theme.mjs";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";
import "./styles.css";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import french from "@astryxdesign/core/locales/fr-FR.json";
const Live = React.lazy(() => import("./live.jsx"));
import {
  sections,
  labels,
  demoDossier,
  clientProjection,
  readiness,
  shareVersion,
  createRevision,
  recordResponse,
} from "./domain.mjs";

const brand = { name: "Sestet", descriptor: "Vos missions, bien cadrées." };
const Icon = ({ children }) => (
  <span className="symbol" aria-hidden="true">
    {children}
  </span>
);
const Action = ({ children, primary = false, ...props }) => (
  <Button
    label={children}
    variant={primary ? "primary" : "secondary"}
    size="lg"
    {...props}
  />
);
const Pill = ({ status }) => (
  <span className={`pill ${status}`}>{labels[status] || status}</span>
);
function Logo() {
  return (
    <a className="logo" href="#/">
      <span className="brandmark" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      {brand.name}
    </a>
  );
}

function Proposal({ version }) {
  const publicVersion = clientProjection(version);
  return (
    <article className="proposal">
      <div className="document-head">
        <span>PROPOSITION DE MISSION</span>
        <span>VERSION {publicVersion.number}</span>
      </div>
      <h2>{publicVersion.title}</h2>
      <p className="document-client">Pour {publicVersion.client}</p>
      {publicVersion.consultant?.name && (
        <p className="document-client">
          {publicVersion.consultant.name} · {publicVersion.consultant.contact}
        </p>
      )}
      {publicVersion.consultant?.logo && (
        <img
          src={publicVersion.consultant.logo}
          alt="Logo du consultant"
          width="80"
        />
      )}
      {sections.map(([key, title], i) => (
        <section key={key}>
          <h3>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {title}
          </h3>
          <p>
            {publicVersion.content[key] ||
              (key === "questions"
                ? "Aucun point ouvert sur cette version."
                : "À compléter.")}
          </p>
        </section>
      ))}
      <footer>
        Accord de cadrage sur une version précise. Ce parcours n’est pas une
        signature électronique certifiée.
      </footer>
    </article>
  );
}

function Landing() {
  const example = demoDossier().versions[0];
  return (
    <>
      <header className="public-header">
        <Logo />
        <nav aria-label="Navigation principale">
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#tarif">Tarif</a>
          <a href="#/aide">Guide</a>
        </nav>
        <Action href="#/demo" primary>
          Essayer la démo
        </Action>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              POUR LES CONSULTANTS INDÉPENDANTS · STRATÉGIE & OPÉRATIONS
            </p>
            <h1>
              Votre expertise.
              <br />
              Une proposition <em>bien cadrée.</em>
            </h1>
            <p className="lead">
              Du nouveau brief à une mission claire : préparez votre proposition
              à partir de vos références, levez les ambiguïtés et gardez la
              trace de ce qui a été convenu.
            </p>
            <div className="actions">
              <Action href="#/demo" primary>
                Essayer la démo →
              </Action>
              <Action href="#/demarrage">Accès consultant</Action>
            </div>
            <p className="caption">
              Démo fictive, sans compte. Vous décidez des prix, des délais et
              des engagements.
            </p>
          </div>
          <div
            className="hero-preview"
            aria-label="Exemple fictif de proposition"
          >
            <div className="preview-top">
              <span>
                <span className="dot" /> ATELIER RIVAGE
              </span>
              <Pill status="draft" />
            </div>
            <h2>Diagnostic opérationnel</h2>
            <p className="muted">Proposition préparée pour relecture</p>
            <div className="preview-line">
              <Icon>01</Icon>
              <div>
                <strong>Un périmètre explicite</strong>
                <p>Cartographie, six entretiens, plan d’action.</p>
              </div>
            </div>
            <div className="preview-line">
              <Icon>02</Icon>
              <div>
                <strong>Des exclusions visibles</strong>
                <p>La mise en œuvre fera l’objet d’un autre accord.</p>
              </div>
            </div>
            <div className="question-preview">
              <span className="eyebrow">À CLARIFIER AVANT PARTAGE</span>
              <p>{example.content.questions}</p>
            </div>
            <div className="preview-foot">
              <span>2 références sélectionnées</span>
              <span>Exemple fictif ↗</span>
            </div>
          </div>
        </section>
        <section className="work-strip">
          <span>MOINS DE FLOU À CHAQUE ÉTAPE</span>
          <strong>Brief</strong>
          <span aria-hidden="true">→</span>
          <strong>Proposition</strong>
          <span aria-hidden="true">→</span>
          <strong>Clarification</strong>
          <span aria-hidden="true">→</span>
          <strong>Accord documenté</strong>
        </section>
        <section className="editorial" id="fonctionnement">
          <div>
            <p className="eyebrow">REPARTIR DE VOTRE SAVOIR-FAIRE</p>
            <h2>
              Votre prochaine mission
              <br />
              ne part pas d’une page blanche.
            </h2>
            <p>
              Vos anciennes propositions sont utiles. À condition de choisir ce
              que vous pouvez réutiliser et de distinguer ce qui reste à
              confirmer.
            </p>
          </div>
          <ol className="steps">
            <li>
              <span>1</span>
              <div>
                <h3>Choisissez vos références</h3>
                <p>
                  Sélectionnez les prestations et les méthodes autorisées pour
                  ce dossier. Aucune autre référence ne doit être réutilisée à
                  votre insu.
                </p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Relisez une proposition structurée</h3>
                <p>
                  Objectifs, livrables, exclusions et dépendances. Le prix et le
                  calendrier restent des décisions du consultant.
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Faites clarifier, puis valider</h3>
                <p>
                  Chaque réponse est rattachée à sa version. Un nouveau prix ou
                  livrable appelle un nouvel accord.
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="split-band">
          <div>
            <p className="eyebrow">UNE AIDE À LA PRÉPARATION</p>
            <h2>
              L’IA propose.
              <br />
              Vous vous engagez.
            </h2>
          </div>
          <div>
            <p>
              L’expérience présentée vise une génération fondée sur les seules
              sources sélectionnées. Le consultant relit les formulations et
              confirme les informations manquantes avant de partager.
            </p>
            <p className="caption">
              Dans la démo, les résultats sont précalculés. Aucune IA, aucun
              email et aucun paiement ne sont déclenchés par la démo.
            </p>
          </div>
        </section>
        <section className="pricing" id="tarif">
          <div>
            <p className="eyebrow">OFFRE DE LANCEMENT ENVISAGÉE</p>
            <h2>
              Un espace pour vos propositions.
              <br />
              Un accès gratuit pour vos clients.
            </h2>
            <p>
              Pour les consultants qui préparent régulièrement des missions. Le
              tarif et les conditions seront confirmés avant toute souscription.
            </p>
          </div>
          <div className="price">
            <p>
              <strong>49 $ US</strong> / mois
            </p>
            <ul>
              <li>Un consultant</li>
              <li>Dix nouvelles propositions par période mensuelle</li>
              <li>Édition manuelle sans décompte supplémentaire</li>
              <li>Lecteurs clients gratuits</li>
            </ul>
            <p className="caption">
              Trois corrections IA par dossier et par période sont prévues.
              Offre en préparation : aucune souscription ni aucun encaissement
              réel.
            </p>
            <Action href="#/demo" primary>
              Voir un dossier de démonstration
            </Action>
          </div>
        </section>
        <section className="faq">
          <p className="eyebrow">AVANT DE COMMENCER</p>
          <h2>Des réponses claires.</h2>
          {[
            [
              "À qui s’adresse Sestet ?",
              "D’abord aux consultants indépendants en stratégie ou opérations. Quatre propositions par mois est une hypothèse de qualification à tester, pas une condition d’utilisation.",
            ],
            [
              "Mon client verra-t-il mes références ?",
              "La vue client de la démo contient uniquement la proposition sélectionnée. Les références, notes privées et dossiers des autres clients sont exclus. Le partage réel protégé doit être connecté et testé avant le lancement.",
            ],
            [
              "Est-ce une signature électronique ?",
              "Non. Le produit vise un accord explicite sur le cadrage d’une version. Il ne remplace pas une signature contractuelle certifiée.",
            ],
            [
              "Sestet encaisse-t-il mes honoraires ?",
              "Non. L’abonnement concerne uniquement le logiciel. Votre client vous règle la mission directement, selon vos propres modalités.",
            ],
            [
              "Puis-je déjà utiliser mes vrais dossiers ?",
              "Pas dans cette démo : elle utilise des données fictives et temporaires. Authentification, stockage privé, IA, emails et facturation doivent être configurés et vérifiés avant de recevoir des documents réels.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </main>
      <footer className="public-footer">
        <Logo />
        <span>{brand.descriptor}</span>
        <a href="#/aide">Aide</a>
        <a href="/ressources/modele-proposition-conseil/">Ressources</a>
        <a href="#/informations">Informations & confidentialité</a>
        <span>Démo publique · comptes bientôt disponibles</span>
      </footer>
    </>
  );
}

function Demo() {
  const [dossier, setDossier] = useState(demoDossier);
  const [page, setPage] = useState("proposal");
  const [role, setRole] = useState("consultant");
  const [selected, setSelected] = useState(0);
  const [notice, setNotice] = useState("");
  const [response, setResponse] = useState("");
  const [kind, setKind] = useState("question");
  const [consent, setConsent] = useState(false);
  const version = dossier.versions[selected];
  const editable = ["draft", "ready"].includes(version.status);
  const missing = readiness(version);
  const update = (fn) =>
    setDossier((d) => ({
      ...d,
      versions: d.versions.map((v, i) => (i === selected ? fn(v) : v)),
    }));
  function revise() {
    const next = createRevision(version, version.content, crypto.randomUUID());
    setDossier((d) => ({
      ...d,
      versions: [
        ...d.versions.map((v) => ({ ...v, status: "superseded" })),
        next,
      ],
    }));
    setSelected(dossier.versions.length);
    setPage("proposal");
    setRole("consultant");
    setNotice(
      "Nouvelle version créée. Les réponses précédentes restent dans l’historique.",
    );
  }
  function reset() {
    setDossier(demoDossier());
    setPage("proposal");
    setSelected(0);
    setRole("consultant");
    setNotice("Démo réinitialisée.");
    setResponse("");
    setConsent(false);
  }
  function fillExample() {
    update((v) => ({
      ...v,
      priceConfirmed: true,
      timelineConfirmed: true,
      content: {
        ...v.content,
        price:
          "4 800 EUR HT, 40 % au démarrage et 60 % à la restitution. Conditions fictives renseignées par Camille.",
        timeline:
          "Trois semaines à partir du démarrage convenu, sous réserve de recevoir les données et disponibilités. Calendrier fictif confirmé par Camille.",
        questions: "",
        assumptions:
          "Un seul site est concerné. Les six entretiens incluent les responsables logistique et commercial.",
      },
    }));
    setNotice(
      "Conditions fictives renseignées. Relisez la proposition puis ouvrez l’aperçu client.",
    );
  }
  function respond(e) {
    e.preventDefault();
    if (kind === "approval" && !consent) return;
    try {
      update((v) =>
        recordResponse(v, {
          type: kind,
          text:
            kind === "approval"
              ? "Je donne mon accord sur cette version et ses conditions."
              : response,
          provenance: "client",
          at: new Date().toISOString(),
        }),
      );
      setResponse("");
      setConsent(false);
      setNotice("Réponse fictive enregistrée sur cette version. Aucun envoi.");
    } catch (e) {
      setNotice(e.message);
    }
  }
  const nextAction =
    version.status === "approved"
      ? "Accord reçu sur cette version. Consultant : conservez le récapitulatif."
      : version.status === "changes_requested"
        ? "Consultant : préparez une nouvelle version pour répondre à la demande."
        : version.status === "shared"
          ? "Client : consultez la proposition et répondez explicitement."
          : version.status === "superseded"
            ? "Version remplacée : consultez la version la plus récente."
            : `Consultant : ${missing.length ? "complétez les points à confirmer avant partage." : "prévisualisez puis partagez cette version."}`;
  return (
    <>
      <div className="demo-banner">
        <span>
          <strong>DÉMONSTRATION</strong> Données fictives · IA précalculée ·
          aucune connexion à des dossiers réels
        </span>
        <button onClick={reset}>Réinitialiser ↺</button>
      </div>
      <header className="app-header">
        <Logo />
        <div className="role-switch" aria-label="Point de vue de démonstration">
          <button
            aria-pressed={role === "consultant"}
            onClick={() => {
              setRole("consultant");
              setNotice("");
            }}
          >
            Consultant
          </button>
          <button
            aria-pressed={role === "client"}
            onClick={() => {
              setRole("client");
              setPage("preview");
              setNotice("");
            }}
          >
            Client invité
          </button>
        </div>
        <span className="avatar" title="Camille Laurent, consultante fictive">
          CL
        </span>
      </header>
      <div
        className={`workspace ${role === "client" ? "client-workspace" : ""}`}
      >
        {role === "consultant" && (
          <aside className="sidebar">
            <p className="sidebar-caption">ESPACE DE CAMILLE</p>
            <nav aria-label="Bureau du consultant">
              {[
                ["dashboard", "◫", "Vue d’ensemble"],
                ["brief", "↳", "Brief & références"],
                ["proposal", "≡", "Proposition"],
                ["history", "◷", "Versions & réponses"],
                ["preview", "↗", "Aperçu client"],
              ].map(([key, symbol, title]) => (
                <button
                  key={key}
                  className={page === key ? "active" : ""}
                  onClick={() => {
                    setPage(key);
                    setNotice("");
                  }}
                >
                  <Icon>{symbol}</Icon>
                  {title}
                </button>
              ))}
            </nav>
            <div className="sidebar-help">
              <strong>Votre prochain geste</strong>
              <p>{nextAction}</p>
              <a href="#/aide">Guide du consultant →</a>
            </div>
            <p className="sidebar-caption">DOSSIER FICTIF</p>
            <strong>Atelier Rivage</strong>
            <p className="caption">Diagnostic opérationnel</p>
          </aside>
        )}
        <main id="main" className="work-main">
          <div className="breadcrumb">
            {role === "client"
              ? "Vue client · exemple fictif"
              : "Dossiers / Atelier Rivage"}{" "}
            / Proposition
          </div>
          <div className="work-title">
            <div>
              <p className="eyebrow">ATELIER RIVAGE</p>
              <h1>
                {role === "client"
                  ? "Votre proposition de mission"
                  : page === "dashboard"
                    ? "Une mission à préparer."
                    : "Diagnostic opérationnel"}
              </h1>
            </div>
            <Pill status={version.status} />
          </div>
          <div className="next-action">
            <span className="dot" />
            <p>{nextAction}</p>
            <span>Version {version.number}</span>
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
            </div>
          )}
          {page === "dashboard" && (
            <>
              <div className="section-heading">
                <h2>À faire maintenant</h2>
                <span>1 dossier fictif</span>
              </div>
              <div className="task-row">
                <div>
                  <strong>Atelier Rivage</strong>
                  <p>Diagnostic opérationnel · version {version.number}</p>
                </div>
                <Pill status={version.status} />
                <Action onClick={() => setPage("proposal")} primary>
                  Reprendre la proposition
                </Action>
              </div>
              <div className="plain-note">
                <h3>Le fil de la mission</h3>
                <p>
                  1. Lire le brief et choisir les références. 2. Revoir la
                  proposition. 3. Compléter les conditions fictives. 4.
                  Prévisualiser et simuler le partage. 5. Répondre côté client.
                  6. Créer une nouvelle version.
                </p>
              </div>
            </>
          )}
          {page === "brief" && (
            <div className="brief-layout">
              <section className="surface">
                <p className="eyebrow">LE BESOIN DU CLIENT</p>
                <h2>Comprendre les retards de livraison.</h2>
                <p>{dossier.brief}</p>
                <div className="private-note">
                  <strong>Note privée du consultant</strong>
                  <p>{dossier.privateNotes}</p>
                </div>
              </section>
              <section>
                <h2>Références autorisées</h2>
                <p className="muted">
                  Dans cet exemple, seules les deux références cochées ont servi
                  au résultat précalculé.
                </p>
                {dossier.references.map((ref) => (
                  <details className="reference" key={ref.id}>
                    <summary>
                      <span>
                        {ref.selected ? "✓" : "—"} {ref.title}
                      </span>
                      <span className="caption">
                        {ref.selected ? "Sélectionnée" : "Non utilisée"}
                      </span>
                    </summary>
                    <p>{ref.text}</p>
                  </details>
                ))}
                <p className="caption">
                  Sélection illustrative. Pour ce scénario, le résultat préparé
                  reste lié à ces deux références.
                </p>
              </section>
            </div>
          )}
          {page === "proposal" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Votre proposition, à relire.</h2>
                  <p className="muted">
                    Formulations précalculées à partir des références fictives
                    sélectionnées.
                  </p>
                </div>
                <div className="actions">
                  <Action onClick={() => setPage("preview")}>
                    Aperçu client
                  </Action>
                  {!editable && version.status !== "superseded" && (
                    <Action primary onClick={revise}>
                      Créer une nouvelle version
                    </Action>
                  )}
                </div>
              </div>
              <div className="editor-layout">
                <section className="editor surface">
                  {sections.map(([key, title], i) => (
                    <div className="field" key={key}>
                      <label htmlFor={key}>
                        <span className="field-number">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {title}
                      </label>
                      <textarea
                        id={key}
                        readOnly={!editable}
                        rows={key === "deliverables" ? 4 : 3}
                        value={version.content[key]}
                        onChange={(e) =>
                          update((v) => ({
                            ...v,
                            status: "draft",
                            content: { ...v.content, [key]: e.target.value },
                            ...(key === "price"
                              ? { priceConfirmed: false }
                              : key === "timeline"
                                ? { timelineConfirmed: false }
                                : {}),
                          }))
                        }
                      />
                      {["price", "timeline"].includes(key) && (
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            disabled={!editable}
                            checked={version[`${key}Confirmed`]}
                            onChange={(e) =>
                              update((v) => ({
                                ...v,
                                [`${key}Confirmed`]: e.target.checked,
                              }))
                            }
                          />
                          Je confirme{" "}
                          {key === "price"
                            ? "ce prix et ces modalités"
                            : "ce calendrier"}{" "}
                          en tant que consultant.
                        </label>
                      )}
                    </div>
                  ))}
                  <p className="caption">
                    Modifications conservées pendant cette visite uniquement.
                    Rechargez pour repartir de l’exemple.
                  </p>
                </section>
                <aside className="review-panel">
                  <div className="review-status">
                    <p className="eyebrow">AVANT LE PARTAGE</p>
                    <h3>
                      {missing.length
                        ? `${missing.length} points à compléter`
                        : "Prêt pour votre relecture finale"}
                    </h3>
                    {missing.length > 0 ? (
                      <ul>
                        {missing.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        Les conditions sont renseignées et les questions
                        ouvertes sont résolues.
                      </p>
                    )}
                    {editable && (
                      <Action onClick={fillExample}>
                        Renseigner les conditions fictives
                      </Action>
                    )}
                  </div>
                  <h3>Sur quoi repose ce texte ?</h3>
                  {version.evidence.map((e) => (
                    <details className="evidence" key={e.field}>
                      <summary>
                        {sections.find(([k]) => k === e.field)[1]}
                        <span>{e.kind}</span>
                      </summary>
                      <p>« {e.quote} »</p>
                      <small>
                        {
                          dossier.references.find((r) => r.id === e.sourceId)
                            ?.title
                        }
                      </small>
                    </details>
                  ))}
                  <p className="caption">
                    Les sources et cette colonne restent privées.
                  </p>
                </aside>
              </div>
            </>
          )}
          {page === "history" && (
            <section className="surface">
              <h2>Versions & réponses</h2>
              <p className="muted">
                Une modification ne transfère pas l’accord d’une version à la
                suivante.
              </p>
              {dossier.versions.map((v, i) => (
                <div className="version-row" key={v.id}>
                  <div className="section-heading">
                    <h3>Version {v.number}</h3>
                    <Pill status={v.status} />
                    <Action
                      onClick={() => {
                        setSelected(i);
                        setPage("preview");
                      }}
                    >
                      Consulter cette version
                    </Action>
                  </div>
                  {v.responses.length ? (
                    v.responses.map((r, j) => (
                      <blockquote key={j}>
                        <strong>
                          {r.type === "approval"
                            ? "Accord"
                            : r.type === "changes"
                              ? "Modification demandée"
                              : "Question"}{" "}
                          · client fictif · version {v.number}
                        </strong>
                        <p>{r.text}</p>
                        <small>
                          {r.provenance === "transcribed"
                            ? "Retranscrit par le consultant"
                            : "Saisi dans la vue client de démonstration"}
                        </small>
                      </blockquote>
                    ))
                  ) : (
                    <p className="muted">
                      Aucune réponse. Le silence ne vaut pas accord.
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
          {page === "preview" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>
                    {role === "consultant"
                      ? "Ce que verra votre client"
                      : "Relisez le périmètre et les conditions"}
                  </h2>
                  <p className="muted">
                    Aucune note privée ni référence source dans ce document.
                  </p>
                </div>
                <div className="actions">
                  <Action onClick={() => window.print()}>
                    Imprimer / enregistrer en PDF
                  </Action>
                  {role === "consultant" && editable && (
                    <Action
                      primary
                      isDisabled={missing.length > 0}
                      onClick={() => {
                        update((v) =>
                          shareVersion(v, new Date().toISOString()),
                        );
                        setRole("client");
                        setNotice(
                          "Partage simulé. Aucun lien envoyé et aucun email déclenché.",
                        );
                      }}
                    >
                      Simuler le partage
                    </Action>
                  )}
                </div>
              </div>
              {editable && (
                <p className="warning">
                  Aperçu de brouillon :{" "}
                  {missing.length
                    ? "complétez les points ouverts avant partage."
                    : "prêt à partager dans la démonstration."}
                </p>
              )}
              <div className="client-layout">
                <Proposal version={version} />
                {role === "client" && (
                  <aside className="client-response">
                    <h2>Votre réponse</h2>
                    <p>
                      Elle concernera uniquement la version {version.number}.
                    </p>
                    {["shared", "changes_requested"].includes(
                      version.status,
                    ) ? (
                      <form onSubmit={respond}>
                        <label htmlFor="response-kind">
                          Que souhaitez-vous faire ?
                        </label>
                        <select
                          id="response-kind"
                          value={kind}
                          onChange={(e) => {
                            setKind(e.target.value);
                            setConsent(false);
                          }}
                        >
                          <option value="question">Poser une question</option>
                          <option value="changes">
                            Demander une modification
                          </option>
                          <option value="approval">Donner mon accord</option>
                        </select>
                        {kind === "approval" ? (
                          <label className="checkbox">
                            <input
                              type="checkbox"
                              checked={consent}
                              onChange={(e) => setConsent(e.target.checked)}
                              required
                            />
                            J’ai relu et j’approuve explicitement la version{" "}
                            {version.number}, y compris son périmètre, son prix
                            et son calendrier.
                          </label>
                        ) : (
                          <>
                            <label htmlFor="response">Votre message</label>
                            <textarea
                              id="response"
                              required
                              maxLength={2000}
                              rows={5}
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              placeholder="Précisez votre question ou le changement souhaité."
                            />
                          </>
                        )}
                        <Action primary type="submit">
                          Enregistrer la réponse fictive
                        </Action>
                        <p className="caption">
                          Ceci n’est ni une signature certifiée ni un engagement
                          réel.
                        </p>
                      </form>
                    ) : (
                      <p className="plain-note">
                        {version.status === "approved"
                          ? "Votre accord fictif est enregistré sur cette version."
                          : "Cette version ne peut pas recevoir de réponse. Le consultant doit d’abord la partager."}
                      </p>
                    )}
                    {version.responses.map((r, i) => (
                      <blockquote key={i}>
                        <strong>
                          Votre réponse · version {version.number}
                        </strong>
                        <p>{r.text}</p>
                      </blockquote>
                    ))}
                  </aside>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function Info({ page }) {
  return (
    <>
      <header className="public-header">
        <Logo />
        <Action href="#/demo" primary>
          Essayer la démo
        </Action>
      </header>
      <main id="main" className="info-page">
        <p className="eyebrow">SESTET · GUIDE</p>
        <h1>
          {page === "aide"
            ? "Une mission, du brief à l’accord."
            : page === "demarrage"
              ? "Votre futur espace consultant."
              : "Informations & confidentialité"}
        </h1>
        {page === "demarrage" ? (
          <>
            <p className="lead">
              La création de comptes réels n’est pas encore activée dans cette
              prévisualisation.
            </p>
            <p>
              Le parcours de démonstration est prêt à explorer. Il ne conserve
              pas de documents réels, n’envoie aucun email et ne facture rien.
              Les accès, la sauvegarde serveur et les services externes doivent
              être configurés et testés avant l’ouverture des pilotes.
            </p>
            <Action href="#/demo" primary>
              Découvrir le parcours fictif
            </Action>
          </>
        ) : page === "aide" ? (
          <>
            <h2>Pour le consultant</h2>
            <ol className="guide">
              <li>
                <strong>À la première configuration.</strong> Préparez votre
                activité, vos coordonnées et les références que vous êtes
                autorisé à réutiliser.
              </li>
              <li>
                <strong>À réception d’un brief.</strong> Créez un dossier et
                choisissez ses références. Distinguez les besoins du client de
                vos hypothèses.
              </li>
              <li>
                <strong>Avant l’envoi.</strong> Corrigez la proposition, levez
                les questions et confirmez prix et calendrier. Vérifiez la vue
                client.
              </li>
              <li>
                <strong>Après un retour.</strong> Conservez la réponse sur sa
                version. Si le périmètre change, préparez une nouvelle version
                et demandez un nouvel accord.
              </li>
            </ol>
            <h2>Une semaine possible</h2>
            <p>
              Lundi : préparer un diagnostic. Mardi : lever une ambiguïté avec
              le prospect. Jeudi : partager la proposition révisée. Vendredi :
              conserver son accord. Le produit accompagne les missions ; il
              n’exige pas une utilisation quotidienne.
            </p>
            <h2>Pour le client invité</h2>
            <p>
              Relisez les livrables, exclusions, prix et échéances. Posez une
              question, demandez une modification ou donnez explicitement votre
              accord. Votre réponse est rattachée à la version affichée. Vous
              n’avez pas d’abonnement Sestet à payer.
            </p>
            <h2>Comprendre les états</h2>
            <dl>
              {Object.entries(labels).map(([key, label]) => (
                <React.Fragment key={key}>
                  <dt>{label}</dt>
                  <dd>
                    {
                      {
                        draft: "Le consultant prépare le contenu.",
                        ready:
                          "La proposition est relue, mais pas encore partagée.",
                        shared: "Le client peut consulter et répondre.",
                        changes_requested:
                          "Le consultant doit traiter une demande de modification.",
                        approved:
                          "Un accord explicite concerne cette version uniquement.",
                        superseded:
                          "Une nouvelle version existe ; celle-ci reste dans l’historique.",
                      }[key]
                    }
                  </dd>
                </React.Fragment>
              ))}
            </dl>
            <h2>Abonnement et honoraires</h2>
            <p>
              Le consultant paiera Sestet pour le logiciel selon l’offre
              confirmée. Les honoraires de conseil restent payés directement au
              consultant, sans commission Sestet.
            </p>
          </>
        ) : (
          <>
            <h2>État de cette version</h2>
            <p>
              La démo publique utilise uniquement des données fictives. La démo
              garde ses modifications en mémoire pendant la visite ; elle
              n’utilise ni serveur de dossiers, ni stockage navigateur
              persistant, ni analyse d’audience.
            </p>
            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par Cloudflare, Inc. Les services
              d’hébergement peuvent traiter des journaux techniques de
              connexion. Aucun outil publicitaire ou de mesure d’audience n’est
              installé. La démo ne transmet pas les modifications de ses
              propositions au serveur.
            </p>
            <h2>Avant l’ouverture des comptes</h2>
            <p>
              Identité et statut de l’exploitante, adresse professionnelle,
              immatriculation éventuelle, contact de support, responsable de
              publication, hébergeurs et sous-traitants réellement retenus,
              durées de conservation, modalités de suppression et conditions de
              vente.
            </p>
            <p>
              Ces éléments ne sont pas inventés. Cette page ne constitue pas des
              mentions légales finalisées.
            </p>
          </>
        )}
      </main>
    </>
  );
}

function App() {
  const [route, setRoute] = useState(location.hash || "#/");
  React.useEffect(() => {
    const listener = () => {
      if (location.hash.startsWith("#/") || !location.hash) {
        setRoute(location.hash || "#/");
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  const live =
    ["#/demarrage", "#/espace", "#/client"].includes(route) ||
    route.startsWith("#/connexion/") ||
    route.startsWith("#/invitation/");
  return (
    <Theme theme={sestetTheme} mode="light">
      {live ? (
        <React.Suspense
          fallback={<p role="status">Ouverture de votre espace…</p>}
        >
          <Live route={route} ui={{ Logo, Action, Proposal, Pill }} />
        </React.Suspense>
      ) : (
        <>
          <a className="skip-link" href="#main">
            Aller au contenu
          </a>
          {route === "#/demo" ? (
            <Demo />
          ) : ["#/aide", "#/informations"].includes(route) ? (
            <Info page={route.slice(2)} />
          ) : (
            <Landing />
          )}
        </>
      )}
    </Theme>
  );
}

createRoot(document.getElementById("root")).render(
  <InternationalizationProvider locale="fr-FR" messages={{ "fr-FR": french }}>
    <App />
  </InternationalizationProvider>,
);
