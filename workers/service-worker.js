let websocket;

//Keep the service worker active as long as chatgpt is opened in a tab
chrome.runtime.onMessage.addListener(function (request) {
  if (request?.id) {
    websocket.send(JSON.stringify(request));
  }
});

function connect() {
  websocket = new WebSocket("ws://localhost:8765");

  websocket.onerror = (event) => {
    setTimeout(() => {
      connect();
    }, 1000);
  };

  websocket.onopen = (event) => {
    console.log("websocket open");

    const keepAliveIntervalId = keepAlive(websocket);

    websocket.onmessage = async (event) => {
      console.log(`websocket received message: ${event.data}`);

      const [tab] = await chrome.tabs.query({
        url: "https://chat.openai.com/*",
      });

      try {
        const data = JSON.parse(event.data);
        await chrome.tabs.sendMessage(tab.id, data);
      } catch (e) {
        console.log(e);
      }
    };

    websocket.onclose = (event) => {
      console.log("websocket connection closed");

      websocket = null;
      clearInterval(keepAliveIntervalId);

      connect();
    };
  };
}

function keepAlive(websocket) {
  const intervalId = setInterval(() => {
    websocket.send("keepalive");
  }, 20_000);

  return intervalId;
}

connect();
