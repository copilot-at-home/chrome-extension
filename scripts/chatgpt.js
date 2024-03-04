let currentRequest, isResponding;

chrome.runtime.onMessage.addListener(function (request) {
  currentRequest = request;
  sendMessage();
});

function sendMessage() {
  const textarea = document.getElementById("prompt-textarea");
  textarea.value = currentRequest.content;

  const inputEvent = new CustomEvent("input", { bubbles: true });
  textarea.dispatchEvent(inputEvent);

  const sendBtn = document.querySelector('[data-testid="send-button"]');
  sendBtn.click();

  listenForGptResponse();
}

function listenForGptResponse() {
  setTimeout(async () => {
    const sendBtn = document.querySelector('[data-testid="send-button"]');
    if (sendBtn) {
      console.log("Waiting for request/response...");

      if (isResponding) {
        await forwardGptResponseToSW(true);
      } else {
        listenForGptResponse();
      }
    } else {
      await forwardGptResponseToSW(false);
    }
  }, 500);
}

async function forwardGptResponseToSW(isLastChunk) {
  const endOfMessageIdentifier = "@@@@@";
  const responseElements = document.querySelectorAll(
    '[data-message-author-role="assistant"]'
  );

  const lastResponseElement = responseElements[responseElements.length - 1];
  let responseHtml = lastResponseElement.firstElementChild.innerHTML;

  if (isLastChunk) {
    isResponding = false;
    responseHtml += endOfMessageIdentifier;
  } else {
    isResponding = true;
  }

  await chrome.runtime.sendMessage({
    id: currentRequest.id,
    content: responseHtml,
  });

  if (isResponding) {
    listenForGptResponse();
  }
}
