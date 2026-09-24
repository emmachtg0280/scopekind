import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@astryxdesign/core/theme";
import { AppShell } from "@astryxdesign/core/AppShell";
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid } from "@astryxdesign/core/Grid";
import { Text, Heading } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";
import { Token } from "@astryxdesign/core/Token";
import { List, ListItem } from "@astryxdesign/core/List";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { scopeKindTheme } from "./theme.js";
import {
  seed,
  restore,
  recordResponse,
  exportSummary,
  STORAGE_KEY,
} from "./model.mjs";
import "@astryxdesign/core/reset.css";
import "@astryxdesign/core/astryx.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-700.css";
import scopekindLogo from "../favicon.svg";

// Structural budgets: 224px navigation; two content columns at 1100px;
// one column on smaller screens. Interior spacing comes from Astryx tokens.
const surface = {
  background: "var(--color-background-surface)",
  border: "var(--sk-line)",
  borderRadius: "var(--radius-container)",
  minWidth: 0,
};
const subtle = {
  background: "var(--color-background-wash)",
  borderRadius: "var(--radius-container)",
};
const categoryLabels = {
  clarification: "Needs clarity",
  additional: "Additional work",
  included: "Included revision",
};
const statusLabels = {
  open: "To review",
  approved: "Approved · demo",
  changes: "Changes requested",
  clarify: "Needs clarification",
};
const categoryColours = {
  clarification: "orange",
  additional: "blue",
  included: "green",
};

function Glyph({ name = "grid" }) {
  const paths = {
    grid: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z",
    chat: "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z",
    check: "m5 12 4 4L19 6",
    file: "M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    download: "M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4",
    moon: "M20 15A8 8 0 0 1 9 4a8 8 0 1 0 11 11Z",
    reset: "M4 9a8 8 0 1 1 0 7M4 3v6h6",
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}

function useWide() {
  const [wide, setWide] = useState(
    () => window.matchMedia("(min-width:1100px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(min-width:1100px)");
    const change = () => setWide(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return wide;
}

function App() {
  const [state, setState] = useState(() => {
    try {
      return restore(localStorage.getItem(STORAGE_KEY));
    } catch {
      return seed();
    }
  });
  const [section, setSection] = useState("feedback");
  const [selected, setSelected] = useState("premium");
  const [drafts, setDrafts] = useState({});
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");
  const [storageOK, setStorageOK] = useState(true);
  const [mode, setMode] = useState("light");
  const [navOpen, setNavOpen] = useState(false);
  const wide = useWide();
  const request = state.requests.find((r) => r.id === selected);
  const draft = drafts[selected] || request;
  const dirty = JSON.stringify(draft) !== JSON.stringify(request);
  const pending = state.requests.filter((r) => r.status !== "approved").length;
  const visible = state.requests.filter(
    (r) =>
      filter === "all" ||
      (filter === "open"
        ? r.status !== "approved"
        : r.category === "additional"),
  );
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageOK(true);
    } catch {
      setStorageOK(false);
    }
  }, [state]);
  const navigate = (next) => {
    setSection(next);
    setNavOpen(false);
    setNotice("");
  };
  const edit = (field, value) =>
    setDrafts((d) => ({
      ...d,
      [selected]: { ...draft, [field]: value.slice(0, 4000) },
    }));
  const saveDraft = () => {
    const saved = { ...draft, status: dirty ? "open" : request.status };
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === selected ? saved : r)),
    }));
    setDrafts((d) => {
      const next = { ...d };
      delete next[selected];
      return next;
    });
    setNotice("Draft saved. Nothing has been sent to the client.");
  };
  const startPreview = () => {
    saveDraft();
    setResponse("");
    setComment("");
    setPreview(true);
  };
  const submitResponse = () => {
    if (!response) return;
    setState((s) => recordResponse(s, selected, response, comment));
    setPreview(false);
    setSection("decisions");
    setNotice("Simulated response recorded in the decision history.");
  };
  const exportFile = () => {
    const blob = new Blob([exportSummary(state)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Poma_Decision_Summary.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      "Decision summary exported, including sources and simulated responses.",
    );
  };
  const reset = () => {
    setState(seed());
    setDrafts({});
    setSelected("premium");
    setSection("feedback");
    setFilter("all");
    setResetOpen(false);
    setNotice("The Poma example has been reset.");
  };
  const sidebar = (
    <SideNav
      style={{ width: 224 }}
      header={
        <SideNavHeading
          heading="ScopeKind"
          subheading="Room for good work."
          icon={
            <img
              src={scopekindLogo}
              alt=""
              style={{ width: "var(--spacing-8)", height: "var(--spacing-8)" }}
            />
          }
        />
      }
      footer={
        <VStack gap={3} padding={4}>
          <Text type="supporting">FICTIONAL PROJECT</Text>
          <Text color="secondary">
            Explore the workflow with Poma. Your changes stay in this browser.
          </Text>
          <Button
            label="Reset example"
            variant="ghost"
            icon={<Glyph name="reset" />}
            onClick={() => setResetOpen(true)}
          />
        </VStack>
      }
    >
      <SideNavSection title="YOUR WORKSPACE">
        <SideNavItem
          label="Feedback"
          icon={<Glyph name="chat" />}
          isSelected={section === "feedback"}
          onClick={() => navigate("feedback")}
          endContent={<Badge label={pending} />}
        />
        <SideNavItem
          label="Decision history"
          icon={<Glyph name="check" />}
          isSelected={section === "decisions"}
          onClick={() => navigate("decisions")}
        />
        <SideNavItem
          label="Project brief"
          icon={<Glyph name="file" />}
          isSelected={section === "brief"}
          onClick={() => navigate("brief")}
        />
      </SideNavSection>
      <SideNavSection title="CURRENT PROJECT">
        <SideNavItem
          label="Poma / Brand identity"
          icon={
            <Text weight="bold" color="accent">
              P
            </Text>
          }
          onClick={() => navigate("feedback")}
          isSelected
        />
      </SideNavSection>
    </SideNav>
  );

  return (
    <Theme theme={scopeKindTheme} mode={mode}>
      <AppShell
        sideNav={sidebar}
        variant="section"
        height="auto"
        contentPadding={0}
        mobileNav={{
          isOpen: navOpen,
          onOpenChange: setNavOpen,
          breakpoint: "md",
        }}
      >
        <VStack
          padding={wide ? 8 : 4}
          gap={6}
          maxWidth={1440}
          style={{ marginInline: "auto" }}
        >
          <HStack justify="between" align="center" wrap="wrap" gap={3}>
            <HStack gap={2}>
              <Text color="secondary">Projects</Text>
              <Text color="secondary">/</Text>
              <Text weight="semibold">Poma</Text>
            </HStack>
            <HStack gap={2}>
              <Token label="Interactive demo" size="sm" />
              <Button
                label={
                  mode === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                icon={<Glyph name="moon" />}
                isIconOnly
                variant="ghost"
                onClick={() =>
                  setMode((m) => (m === "light" ? "dark" : "light"))
                }
              />
              <Button
                label="Export summary"
                icon={<Glyph name="download" />}
                onClick={exportFile}
              />
            </HStack>
          </HStack>

          <Grid
            columns={wide ? 2 : 1}
            gap={0}
            style={{ ...surface, overflow: "hidden" }}
          >
            <VStack padding={6} gap={4} justify="center">
              <Text type="supporting">CLIENT PROJECT / 01</Text>
              <Heading level={1}>Poma, clearly on track.</Heading>
              <Text color="secondary">
                A neighbourhood pantry with a little more character.
              </Text>
              <HStack gap={2} wrap="wrap">
                <Token label="Brand identity" />
                <Token label="Revision 2 of 2" />
                <Token
                  color={pending ? "orange" : "green"}
                  label={
                    pending
                      ? `${pending} decisions to resolve`
                      : "All feedback resolved"
                  }
                />
              </HStack>
            </VStack>
            <HStack
              padding={6}
              gap={6}
              align="center"
              justify="between"
              style={{
                background: "var(--sk-paper)",
                color: "var(--sk-olive)",
                minWidth: 0,
              }}
            >
              <VStack gap={1}>
                <Text type="supporting" color="inherit">
                  THE NEIGHBOURHOOD PANTRY
                </Text>
                <Text
                  weight="bold"
                  style={{
                    fontFamily: "var(--font-family-heading)",
                    fontSize: "var(--sk-cover-font)",
                    lineHeight: 1,
                    letterSpacing: "-0.06em",
                    color: "var(--sk-tomato)",
                  }}
                >
                  poma✳
                </Text>
                <Text color="inherit">Good food. Good company.</Text>
              </VStack>
              <VStack
                padding={4}
                gap={4}
                style={{
                  border: "var(--sk-line)",
                  borderColor: "var(--sk-olive)",
                  borderRadius: "var(--radius-container)",
                  transform: "rotate(5deg)",
                }}
              >
                <Text type="supporting" color="inherit">
                  MADE TO FEEL
                </Text>
                <Heading level={2} color="inherit">
                  warm.
                  <br />
                  local.
                  <br />
                  you.
                </Heading>
                <Text color="inherit">IDENTITY / v02</Text>
              </VStack>
            </HStack>
          </Grid>

          <HStack justify="between" align="center" wrap="wrap" gap={3}>
            <HStack
              gap={2}
              wrap="wrap"
              role="group"
              aria-label="Project sections"
            >
              {[
                ["feedback", "Feedback"],
                ["decisions", "Decision history"],
                ["brief", "Project brief"],
              ].map(([key, label]) => (
                <Button
                  key={key}
                  label={label}
                  variant={section === key ? "primary" : "ghost"}
                  aria-pressed={section === key}
                  onClick={() => navigate(key)}
                  endContent={
                    key === "feedback" ? (
                      <Badge label={state.requests.length} />
                    ) : undefined
                  }
                />
              ))}
            </HStack>
            <Text type="supporting">Alex · Client contact</Text>
          </HStack>

          {section === "feedback" && (
            <Grid columns={wide ? 2 : 1} gap={6} align="start">
              <VStack gap={5} style={{ minWidth: 0 }}>
                <VStack gap={1}>
                  <Heading level={2}>
                    A clear next step for every comment.
                  </Heading>
                  <Text color="secondary">
                    Review the source. Agree on the next revision.
                  </Text>
                </VStack>
                <HStack
                  gap={2}
                  wrap="wrap"
                  role="group"
                  aria-label="Filter feedback"
                >
                  {[
                    ["all", "All feedback"],
                    ["open", "To resolve"],
                    ["additional", "Additional work"],
                  ].map(([key, label]) => (
                    <Button
                      key={key}
                      label={label}
                      size="sm"
                      variant={filter === key ? "secondary" : "ghost"}
                      aria-pressed={filter === key}
                      onClick={() => {
                        setFilter(key);
                        const first = state.requests.find(
                          (r) =>
                            key === "all" ||
                            (key === "open"
                              ? r.status !== "approved"
                              : r.category === "additional"),
                        );
                        if (first) setSelected(first.id);
                      }}
                    />
                  ))}
                </HStack>
                <VStack style={surface} padding={2}>
                  <List
                    density="spacious"
                    hasDividers
                    aria-label="Client feedback"
                  >
                    {visible.map((r) => (
                      <ListItem
                        key={r.id}
                        label={r.title}
                        isSelected={selected === r.id}
                        onClick={() => setSelected(r.id)}
                        startContent={
                          <Text
                            color={
                              r.status === "approved" ? "accent" : "secondary"
                            }
                          >
                            {r.status === "approved" ? "✓" : "↗"}
                          </Text>
                        }
                        description={
                          <VStack gap={2} paddingBlock={2}>
                            <Text color="secondary">{r.quote}</Text>
                            <HStack gap={2} wrap="wrap">
                              <Token
                                size="sm"
                                color={
                                  r.status === "approved"
                                    ? "green"
                                    : categoryColours[r.category]
                                }
                                label={
                                  r.status === "approved"
                                    ? statusLabels[r.status]
                                    : categoryLabels[r.category]
                                }
                              />
                              <Text type="supporting">{r.source}</Text>
                            </HStack>
                          </VStack>
                        }
                      />
                    ))}
                  </List>
                  {!visible.length && (
                    <VStack padding={6} gap={2}>
                      <Heading level={3}>All clear.</Heading>
                      <Text color="secondary">
                        No feedback matches this filter.
                      </Text>
                      <Button
                        label="Show all feedback"
                        onClick={() => setFilter("all")}
                      />
                    </VStack>
                  )}
                </VStack>
                <VStack gap={3} padding={5} style={subtle}>
                  <Text weight="semibold">Keep the agreement in view.</Text>
                  <Text color="secondary">
                    One identity. Two revision rounds. Extra deliverables get
                    their own conversation.
                  </Text>
                  <Button
                    label="Read the project brief"
                    variant="ghost"
                    onClick={() => navigate("brief")}
                    icon={<Glyph name="file" />}
                  />
                </VStack>
              </VStack>

              <VStack
                as="section"
                aria-label="Selected feedback"
                style={surface}
              >
                <VStack
                  padding={5}
                  gap={3}
                  style={{ borderBottom: "var(--sk-line)" }}
                >
                  <HStack justify="between" wrap="wrap" gap={2}>
                    <Text type="supporting">YOUR NEXT STEP</Text>
                    <Token
                      color={categoryColours[draft.category]}
                      label={categoryLabels[draft.category]}
                      size="sm"
                    />
                  </HStack>
                  <Heading level={2}>{draft.title}</Heading>
                  <Text type="supporting">
                    {draft.author} · {draft.date} · {draft.version}
                  </Text>
                  <Text
                    as="p"
                    style={{
                      borderInlineStart: "var(--sk-line)",
                      paddingInlineStart: "var(--spacing-3)",
                    }}
                  >
                    {draft.quote}
                  </Text>
                </VStack>
                <VStack padding={5} gap={5}>
                  <TextArea
                    label="Your recommendation"
                    value={draft.recommendation}
                    onChange={(v) => edit("recommendation", v)}
                    rows={3}
                  />
                  <VStack gap={2}>
                    <Text weight="semibold">Why this direction</Text>
                    <Text color="secondary">{draft.reason}</Text>
                  </VStack>
                  <TextArea
                    label="A question for Alex"
                    value={draft.question}
                    onChange={(v) => edit("question", v)}
                    rows={3}
                  />
                  <VStack gap={2} padding={4} style={subtle}>
                    <Text weight="semibold">Scope & timing</Text>
                    <Text color="secondary">{draft.impact}</Text>
                    <Text type="supporting">
                      Example classification · confirm against your agreement.
                    </Text>
                  </VStack>
                  <HStack justify="between" align="center" wrap="wrap" gap={3}>
                    <Button
                      label={dirty ? "Save draft •" : "Save draft"}
                      onClick={saveDraft}
                    />
                    <Button
                      label="Preview client check"
                      variant="primary"
                      onClick={startPreview}
                      endContent={<Glyph name="arrow" />}
                      isDisabled={
                        !draft.question.trim() || !draft.recommendation.trim()
                      }
                    />
                  </HStack>
                  <Text type="supporting">
                    Preview only. No message or approval link is sent.
                  </Text>
                </VStack>
              </VStack>
            </Grid>
          )}

          {section === "decisions" && (
            <VStack gap={5}>
              <HStack justify="between" wrap="wrap" gap={3}>
                <VStack gap={1}>
                  <Heading level={2}>
                    The decision, and the reason behind it.
                  </Heading>
                  <Text color="secondary">
                    Every response stays with its version and context.
                  </Text>
                </VStack>
                <Token label={`${state.history.length} records`} />
              </HStack>
              <VStack style={surface} padding={5}>
                <List
                  hasDividers
                  density="spacious"
                  aria-label="Decision history"
                >
                  {state.history.map((h) => (
                    <ListItem
                      key={h.id}
                      label={h.title}
                      startContent={<Glyph name="check" />}
                      description={
                        <VStack gap={3} paddingBlock={3}>
                          <HStack wrap="wrap" gap={2}>
                            <Token label={h.version} />
                            <Text type="supporting">
                              {h.date.includes("T")
                                ? new Date(h.date).toLocaleString("en-GB")
                                : h.date}
                            </Text>
                          </HStack>
                          <Text
                            color="secondary"
                            style={{
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {h.body}
                          </Text>
                          <Text type="supporting">{h.kind}</Text>
                        </VStack>
                      }
                    />
                  ))}
                </List>
              </VStack>
            </VStack>
          )}

          {section === "brief" && (
            <Grid columns={wide ? 2 : 1} gap={6} align="start">
              <VStack style={surface} gap={5} padding={6}>
                <Text type="supporting">POMA / EXAMPLE AGREEMENT</Text>
                <Heading level={2}>Make the local feel special.</Heading>
                <Text>
                  A visual identity for a neighbourhood pantry: warm, considered
                  and approachable. The brand should feel personal, with enough
                  clarity to work on packaging and small digital formats.
                </Text>
                <Heading level={3}>What we are making</Heading>
                <List hasDividers>
                  <ListItem
                    label="Logo & wordmark"
                    description="Primary identity and a compact version."
                  />
                  <ListItem
                    label="Colour palette"
                    description="Tomato, butter and cobalt, with clear usage guidance."
                  />
                  <ListItem
                    label="Concise brand guide"
                    description="Typography, colour and the core identity in context."
                  />
                </List>
              </VStack>
              <VStack gap={5}>
                <VStack style={surface} gap={4} padding={6}>
                  <Heading level={2}>Room to revise. A clear boundary.</Heading>
                  <Text>
                    Two revision rounds are included for the agreed identity. We
                    are reviewing version 02 in the second round.
                  </Text>
                  <Text>
                    New deliverables, such as social templates, need a separate
                    proposal. Price and timing must be agreed before that work
                    starts.
                  </Text>
                  <Token label="Client contact: Alex" />
                </VStack>
                <VStack padding={5} style={subtle} gap={2}>
                  <Text weight="semibold">A working example</Text>
                  <Text color="secondary">
                    Poma, its messages and its agreement are fictional. Use this
                    screen to explore the workflow; no real client data or
                    connected inbox is involved.
                  </Text>
                </VStack>
              </VStack>
            </Grid>
          )}
          <VStack gap={2} paddingBlock={2}>
            <Text role="status" aria-live="polite" color="accent">
              {notice}
            </Text>
            <Text type="supporting">
              {storageOK
                ? "Example changes saved in this browser."
                : "Browser storage unavailable. Changes last for this visit only."}{" "}
              · No live analysis or client messaging.
            </Text>
          </VStack>
        </VStack>
      </AppShell>

      <Dialog
        isOpen={preview}
        onOpenChange={setPreview}
        width={620}
        maxHeight="90dvh"
        purpose="form"
        padding={6}
      >
        <VStack gap={5}>
          <DialogHeader
            title="Poma / A quick direction check"
            subtitle="Client preview · simulated response"
            onOpenChange={setPreview}
          />
          <VStack gap={3} padding={4} style={subtle}>
            <Token label={request.version} />
            <Heading level={3}>{request.question}</Heading>
            <Text>{request.recommendation}</Text>
            <Text color="secondary">{request.reason}</Text>
            <Text weight="semibold">{request.impact}</Text>
          </VStack>
          <RadioList
            label="Your response"
            value={response}
            onChange={setResponse}
            isRequired
          >
            <RadioListItem
              label="Yes, that is the direction"
              value="approved"
            />
            <RadioListItem label="I would like a change" value="changes" />
            <RadioListItem
              label="I need a little more clarity"
              value="clarify"
            />
          </RadioList>
          <TextArea
            label="Add a note"
            isOptional
            value={comment}
            onChange={(v) => setComment(v.slice(0, 2000))}
            rows={2}
          />
          <Button
            label="Record simulated response"
            variant="primary"
            width="100%"
            isDisabled={!response}
            onClick={submitResponse}
          />
          <Text type="supporting">
            This records an example in your browser. It is not a real client
            approval.
          </Text>
        </VStack>
      </Dialog>
      <Dialog
        isOpen={resetOpen}
        onOpenChange={setResetOpen}
        width={440}
        purpose="form"
        padding={6}
      >
        <VStack gap={5}>
          <DialogHeader
            title="Reset the Poma example?"
            onOpenChange={setResetOpen}
          />
          <Text>
            This removes your local edits and simulated responses, then restores
            the original example.
          </Text>
          <HStack justify="end" gap={2}>
            <Button
              label="Keep my changes"
              onClick={() => setResetOpen(false)}
            />
            <Button
              label="Reset example now"
              variant="destructive"
              onClick={reset}
            />
          </HStack>
        </VStack>
      </Dialog>
    </Theme>
  );
}

createRoot(document.getElementById("workspace-root")).render(<App />);
