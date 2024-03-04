function connect() {
  const websocket = new WebSocket("ws://localhost:8765");

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
    };

    websocket.onclose = (event) => {
      console.log("websocket connection closed");
      clearInterval(keepAliveIntervalId);
      connect();
    };
  };
}

function keepAlive(websocket) {
  const intervalId = setInterval(() => {
    websocket.send("keepalive");
  }, 20 * 1000);

  return intervalId;
}

connect();
