const $ = (id) => document.getElementById(id);
const dialogs = [$("join-dialog"), $("privacy-dialog")];
const triggers = new WeakMap();
function openDialog(dialog, trigger) {
  triggers.set(dialog, trigger);
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
document
  .querySelectorAll("[data-join]")
  .forEach((button) =>
    button.addEventListener("click", () => openDialog(dialogs[0], button)),
  );
$("privacy-open").addEventListener("click", (event) =>
  openDialog(dialogs[1], event.currentTarget),
);
for (const dialog of dialogs) {
  dialog
    .querySelector(".close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    triggers.get(dialog)?.focus();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  });
}
// Both forms use the existing endpoint. No demo content enters this payload.
let savedApplication;
async function submitApplication(form, status, payload, onSuccess) {
  const button = form.querySelector("[type=submit]");
  const previous = button.textContent;
  button.disabled = true;
  form.setAttribute("aria-busy", "true");
  status.className = "form-status";
  status.textContent = "Saving…";
  button.textContent = "Saving…";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch("/api/pilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok || (await response.json()).ok !== true)
      throw new Error("Save not confirmed");
    onSuccess();
  } catch {
    status.className = "form-status error";
    status.textContent = savedApplication
      ? "Your invitation request is saved, but these optional details could not be saved. Please retry or skip."
      : "We could not confirm your request. Please try again; your email is still in the form.";
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.textContent = previous;
    form.removeAttribute("aria-busy");
  }
}
$("pilot-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const payload = Object.fromEntries(new FormData(form));
  submitApplication(form, $("form-status"), payload, () => {
    savedApplication = { email: payload.email, consent: payload.consent };
    form.hidden = true;
    $("form-status").textContent =
      "Request received. We’ll email you about your invitation. Access is not immediate.";
    $("qualification").hidden = false;
    $("discipline").focus();
  });
});
$("qualification-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!savedApplication || !event.currentTarget.reportValidity()) return;
  const form = event.currentTarget;
  const fields = Object.fromEntries(new FormData(form));
  if (!fields.discipline && !fields.message.trim()) {
    dialogs[0].close();
    return;
  }
  submitApplication(
    form,
    $("qualification-status"),
    { ...savedApplication, ...fields },
    () => {
      $("qualification-status").textContent =
        "Optional details saved. Thank you for helping shape the beta.";
      form.hidden = true;
      $("qualification-status").tabIndex = -1;
      $("qualification-status").focus();
    },
  );
});
$("skip-qualification").addEventListener("click", () => dialogs[0].close());

// Demonstrations are local state only. Network requests are restricted to the beta forms above.
function bindTabs(selector, activate) {
  const tabs = [...document.querySelectorAll(selector)];
  function select(tab, focus = false) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    }
    activate(tab);
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        select(tabs[next], true);
      }
    });
  });
  return select;
}
bindTabs("[data-compare]", (tab) => {
  $("view-without").hidden = tab.dataset.compare !== "without";
  $("view-with").hidden = tab.dataset.compare !== "with";
});
bindTabs("[data-example]", (tab) => {
  $("packaging-example").hidden = tab.dataset.example !== "packaging";
  $("social-example").hidden = tab.dataset.example !== "social";
});
const channelCopy = {
  whatsapp: {
    caption: "WhatsApp · Manual sharing example",
    footer: "You would paste the link into your own conversation.",
  },
  email: {
    caption: "Email · Subject: Poma / a quick direction check",
    footer: "A link in your email. No inbox connection or automatic sending.",
  },
  instagram: {
    caption: "Instagram · Direct message preview",
    footer:
      "Share the link in your own DM. This demo does not access Instagram.",
  },
};
bindTabs("[data-channel]", (tab) => {
  const channel = tab.dataset.channel;
  $("conversation-message").dataset.channel = channel;
  $("conversation-message").setAttribute("aria-labelledby", tab.id);
  $("channel-caption").textContent = channelCopy[channel].caption;
  $("conversation-footer").textContent = channelCopy[channel].footer;
});
const suggestionData = [
  {
    kind: "Approved direction",
    title: "Review suggested next step",
    reason: "This request may reopen an approved direction.",
    oldLabel: "Previously approved",
    old: "Minimal identity · Approved by Alex, September 8",
    request: "“Can we explore the illustrated direction again?”",
    question:
      "Would you like to keep the approved direction, or receive an estimate for another exploration?",
    topic: "Direction check",
    clientTitle: "Confirm the next direction",
    options: [
      "Keep the approved direction",
      "Request an estimate for another exploration",
    ],
  },
  {
    kind: "Conflicting feedback",
    title: "Find a shared direction first",
    reason: "Two reviewers may be asking for incompatible changes.",
    oldLabel: "Alex · Project lead · September 8",
    old: "“Let’s go with the minimal identity.”",
    request:
      "Morgan · Marketing · September 15: “Bring back the illustrated route.”",
    question:
      "Alex and Morgan, should the approved minimal direction still guide the project, or should we agree on a revised direction together first?",
    topic: "Reviewer alignment",
    clientTitle: "Agree on one shared direction",
    options: [
      "Keep the approved minimal direction",
      "Bring both reviewers together before proceeding",
    ],
  },
  {
    kind: "Additional deliverable",
    title: "Check the addition separately",
    reason: "This request may add a deliverable to the agreed scope.",
    oldLabel: "Agreed scope · Project brief",
    old: "Logo, palette and mini brand guide",
    request:
      "Morgan · September 15: “We’d also love three Instagram launch posts.”",
    question:
      "For the three launch posts, would you like to clarify the formats and timing for a separate proposal, or leave them out of this project for now?",
    topic: "Launch posts check",
    clientTitle: "Clarify the three launch posts",
    options: [
      "Clarify formats and timing for a separate proposal",
      "Leave the launch posts out for now",
    ],
  },
];
let suggestions = suggestionData.map((item) => ({
  ...item,
  text: item.question,
  prepared: false,
}));
let activeSuggestion = 0;
let editing = false;
let checkpoint = null;
let historyEntries = [];
function sizeSuggestion() {
  const field = $("suggestion-text");
  field.style.height = "auto";
  field.style.height =
    Math.min(400, Math.max(120, field.scrollHeight + 2)) + "px";
}
window.addEventListener("resize", sizeSuggestion);
function renderSuggestion(focus = false) {
  const item = suggestions[activeSuggestion];
  $("suggestion-kind").textContent = item.kind;
  $("suggestion-name").textContent = item.title;
  $("suggestion-reason").textContent = item.reason;
  $("evidence-label").textContent = item.oldLabel;
  $("evidence-old").textContent = item.old;
  $("evidence-new").textContent = item.request;
  $("suggestion-text").value = item.text;
  $("suggestion-text").readOnly = !editing;
  sizeSuggestion();
  $("suggestion-text").setCustomValidity("");
  $("edit-suggestion").textContent = editing
    ? "Finish editing"
    : "Edit suggestion";
  $("suggestion-state").textContent = item.prepared
    ? "Reviewed by you · Draft prepared"
    : "System suggestion · Needs review";
  $("suggestion-state").classList.toggle("prepared", item.prepared);
  $("suggestion-count").textContent = `${activeSuggestion + 1} / 3`;
  $("mobile-suggestion-count").textContent = `${activeSuggestion + 1} / 3`;
  $("suggestion-notice").textContent = item.prepared
    ? "Draft prepared. Preview it below; nothing has been sent."
    : "";
  $("prepared-link").hidden = !item.prepared;
  const back = [0, 1, 2].filter((index) => index !== activeSuggestion);
  document.querySelectorAll(".stack-tab").forEach((button, index) => {
    const card = back[index];
    button.dataset.suggestion = card;
    button.textContent = `${String(card + 1).padStart(2, "0")} / ${suggestions[card].kind} ↗`;
    button.className = "stack-tab " + (index === 0 ? "back-one" : "back-two");
  });
  if (focus) {
    $("suggestion-name").tabIndex = -1;
    $("suggestion-name").focus({ preventScroll: true });
  }
}
function chooseSuggestion(index, focus = true) {
  activeSuggestion = (index + 3) % 3;
  editing = false;
  renderSuggestion(focus);
}
document
  .querySelectorAll(".stack-tab")
  .forEach((button) =>
    button.addEventListener("click", () =>
      chooseSuggestion(Number(button.dataset.suggestion)),
    ),
  );
$("previous-suggestion").addEventListener("click", () =>
  chooseSuggestion(activeSuggestion - 1),
);
$("next-suggestion").addEventListener("click", () =>
  chooseSuggestion(activeSuggestion + 1),
);
$("review-direction").addEventListener("click", () => {
  chooseSuggestion(0, false);
  $("suggestions").scrollIntoView({ block: "start" });
  $("edit-suggestion").focus({ preventScroll: true });
});
$("edit-suggestion").addEventListener("click", () => {
  editing = !editing;
  renderSuggestion();
  if (editing) $("suggestion-text").focus();
});
$("suggestion-text").addEventListener("input", (event) => {
  const item = suggestions[activeSuggestion];
  item.text = event.target.value;
  sizeSuggestion();
  item.prepared = false;
  $("suggestion-text").setCustomValidity("");
  $("suggestion-state").textContent = "Edited by you · Needs review";
  $("suggestion-state").classList.remove("prepared");
  $("prepared-link").hidden = true;
  $("suggestion-notice").textContent =
    checkpoint?.index === activeSuggestion
      ? "This edit is not in the earlier draft. Approve it to prepare a new version."
      : "";
});
$("prepare-suggestion").addEventListener("click", () => {
  const item = suggestions[activeSuggestion];
  if (!item.text.trim()) {
    editing = true;
    $("suggestion-text").readOnly = false;
    $("suggestion-text").setCustomValidity(
      "Write a question before preparing the client check.",
    );
    $("suggestion-text").reportValidity();
    return;
  }
  item.prepared = true;
  editing = false;
  checkpoint = {
    index: activeSuggestion,
    question: item.text.trim(),
    prepared: true,
  };
  renderSuggestion();
  configureClient(false);
});
function configureClient(open) {
  const draft = checkpoint || {
    index: 0,
    question: suggestionData[0].question,
    prepared: false,
  };
  const item = suggestionData[draft.index];
  $("client-check-title").textContent = item.clientTitle;
  $("check-ready").querySelector(".eyebrow").textContent =
    (draft.prepared ? "Reviewed by you · " : "Prepared sample · ") + item.topic;
  $("client-check-question").textContent = draft.question;
  $("client-option-one").textContent = item.options[0];
  $("client-option-two").textContent = item.options[1];
  $("client-choice-label").textContent = item.topic;
  $("client-draft-state").textContent = draft.prepared
    ? "Reviewed by designer · Demo draft"
    : "Prepared sample · Demo only";
  $("client-decision-form").reset();
  $("extras-choice").hidden = draft.index === 2;
  $("extras-choice").disabled = draft.index === 2;
  $("check-ready").hidden = open;
  $("client-decision-form").hidden = !open;
  $("response-saved").hidden = true;
  $("restart-check").hidden = !open;
  $("link-preview-topic").textContent = `Identity v02 · ${item.topic}`;
  $("open-client-check").querySelector("strong").textContent =
    `Poma / ${item.topic}`;
  $("outgoing-message").textContent =
    draft.index === 2
      ? "Hi Alex, could you clarify the three launch posts before I prepare a separate proposal? You can review the request here."
      : draft.index === 1
        ? "Hi Alex, could you and Morgan agree on the direction before I continue? I’ve kept both comments with the work here."
        : "Hi Alex, could you confirm the direction before I prepare the final files? You can review it here.";
}
function openClient() {
  configureClient(true);
  $("client-check-title").tabIndex = -1;
  $("client-check-title").focus();
}
$("open-client-check").addEventListener("click", openClient);
$("open-client-inline").addEventListener("click", openClient);
$("restart-check").addEventListener("click", openClient);
function appendText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}
function renderHistory() {
  $("history-list")
    .querySelectorAll("[data-simulated]")
    .forEach((row) => row.remove());
  historyEntries.forEach((entry) => {
    const row = document.createElement("li");
    row.dataset.simulated = "true";
    appendText(row, "time", "September 15 · Demo");
    const copy = appendText(row, "div", "");
    appendText(copy, "strong", entry.decision);
    appendText(copy, "p", "Alex · Identity v02 · " + entry.question);
    if (entry.extra)
      appendText(copy, "p", "Separate launch-post request: " + entry.extra);
    if (entry.comment) appendText(copy, "p", "Comment: " + entry.comment);
    appendText(copy, "p", "Next · " + entry.next, "history-next");
    appendText(
      row,
      "span",
      entry.status,
      "pill " + (entry.status === "Client confirmed" ? "approved" : ""),
    );
    $("history-list").append(row);
  });
  $("history-placeholder").hidden = historyEntries.length > 0;
}
$("client-decision-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  const draft = checkpoint || {
    index: 0,
    question: suggestionData[0].question,
    prepared: false,
  };
  const item = suggestionData[draft.index];
  const first = values["client-decision"] === "keep";
  const decision = item.options[first ? 0 : 1];
  const extra =
    draft.index === 2
      ? ""
      : values["client-extras"] === "clarify"
        ? "Clarify formats and timing before estimating."
        : "Leave out of this project for now.";
  let next, status;
  if (draft.index === 2) {
    next = first
      ? "Sam · Clarify format, dimensions and timing before a proposal."
      : "Sam · Continue with the original deliverables.";
    status = first ? "Clarification requested" : "Addition deferred";
  } else if (first) {
    next =
      "Sam · Continue with the approved minimal direction and original scope.";
    status = "Client confirmed";
  } else if (draft.index === 0) {
    next =
      "Sam · Prepare an exploration estimate; fee and delivery date still need approval.";
    status = "Estimate requested";
  } else {
    next =
      "Sam · Ask Alex and Morgan to agree on the direction before revising.";
    status = "Alignment pending";
  }
  historyEntries.push({
    decision,
    question: draft.question,
    extra,
    comment: values["decision-comment"] || $("decision-comment").value.trim(),
    next,
    status,
  });
  renderHistory();
  $("client-decision-form").hidden = true;
  $("response-saved").hidden = false;
  $("response-summary").textContent =
    decision +
    ". " +
    (extra ? "Launch posts: " + extra + " " : "") +
    "Next: " +
    next;
  $("response-saved").tabIndex = -1;
  $("response-saved").focus();
});
$("reset-story").addEventListener("click", () => {
  historyEntries = [];
  checkpoint = null;
  suggestions = suggestionData.map((item) => ({
    ...item,
    text: item.question,
    prepared: false,
  }));
  chooseSuggestion(0, false);
  renderHistory();
  configureClient(false);
  $("open-client-inline").focus();
});
renderSuggestion();
configureClient(false);
