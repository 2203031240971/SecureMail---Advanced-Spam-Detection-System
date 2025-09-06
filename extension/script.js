document.addEventListener("DOMContentLoaded", () => {
  const scrapeEmails = document.getElementById("scrapeEmails");
  const list = document.getElementById("emailsList");
  const copyAll = document.getElementById("copyAll");

  if (!scrapeEmails || !list) {
    console.error("Required DOM elements not found.");
    return;
  }

  chrome.runtime.onMessage.addListener((request) => {
    const emails = request.emails;
    list.innerHTML = "";

    const countNode = document.querySelector(".results-count");
    const updateCount = (n) => {
      if (countNode)
        countNode.textContent = `${n} email${n !== 1 ? "s" : ""} found`;
      if (copyAll) copyAll.disabled = n === 0;
    };

    if (!emails || emails.length === 0) {
      updateCount(0);
      const li = document.createElement("li");
      li.textContent = "No emails found.";
      list.appendChild(li);
    } else {
      updateCount(emails.length);
      emails.forEach((email) => {
        const li = document.createElement("li");
        li.textContent = email;
        list.appendChild(li);
      });
    }
  });

  if (copyAll) {
    copyAll.addEventListener("click", async () => {
      const items = Array.from(list.querySelectorAll("li"))
        .map((li) => li.textContent || "")
        .filter(Boolean);
      if (items.length === 0) return;
      await navigator.clipboard.writeText(items.join("\n"));
      copyAll.textContent = "Copied!";
      setTimeout(() => (copyAll.textContent = "Copy All"), 1500);
    });
  }

  scrapeEmails.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (
      !tab ||
      !tab.id ||
      (typeof tab.url === "string" &&
        (tab.url.startsWith("chrome://") || tab.url.startsWith("brave://")))
    ) {
      alert(
        "This extension cannot run on internal browser pages like chrome:// or brave://",
      );
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeEmailsFromPage,
    });
  });
});

function scrapeEmailsFromPage() {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g;
  const emails = document.body.innerText.match(emailRegex) || [];
  chrome.runtime.sendMessage({ emails });
}
