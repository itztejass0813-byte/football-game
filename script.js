const players = [

  {
    id: "A",
    name: "ALEX",
    role: "PLAYMAKER",
    x: 27,
    y: 43,
    links: ["B", "C"]
  },

  {
    id: "B",
    name: "BRUNO",
    role: "MIDFIELDER",
    x: 48,
    y: 28,
    links: ["C"]
  },

  {
    id: "C",
    name: "CARLO",
    role: "FORWARD",
    x: 73,
    y: 42,
    links: ["A"]
  },

  {
    id: "D",
    name: "DIEGO",
    role: "WINGER",
    x: 52,
    y: 70,
    links: ["A", "C"]
  }

];


let ranks = {
  A: 0.25,
  B: 0.25,
  C: 0.25,
  D: 0.25
};

let minute = 0;

let round = 1;

let score = [0, 0];

let playing = false;

let timer = null;


const $ = selector =>
  document.querySelector(selector);


function formatPercent(number) {

  return `${(number * 100).toFixed(1)}%`;

}


/*
=========================================
PAGERANK ENGINE
=========================================
*/

function calculatePageRank() {

  const damping = 0.85;

  const numberOfPlayers = players.length;

  const nextRanks = {};

  players.forEach(player => {

    nextRanks[player.id] =
      (1 - damping) / numberOfPlayers;

  });


  /*
    Every player distributes their PageRank
    equally among their outgoing links.
  */

  players.forEach(player => {

    const share =
      ranks[player.id] /
      player.links.length;

    player.links.forEach(target => {

      nextRanks[target] +=
        damping * share;

    });

  });


  return nextRanks;

}


/*
=========================================
SORT PLAYERS
=========================================
*/

function sortedPlayers() {

  return [...players].sort(
    (a, b) =>
      ranks[b.id] - ranks[a.id]
  );

}


/*
=========================================
RENDER PLAYERS
=========================================
*/

function renderPlayers() {

  const container =
    $("#players");

  container.innerHTML = "";


  players.forEach(player => {

    const element =
      document.createElement("div");

    const leader =
      sortedPlayers()[0].id === player.id;


    element.className =
      "player" +
      (leader ? " top" : "");


    element.style.left =
      player.x + "%";

    element.style.top =
      player.y + "%";


    element.innerHTML = `

      <div class="player-rank">
        ${formatPercent(ranks[player.id])}
      </div>

      <div class="player-core">
        ${player.id}
      </div>

      <div class="player-name">
        ${player.name}
      </div>

    `;


    container.appendChild(element);

  });

}


/*
=========================================
DRAW PASSING NETWORK
=========================================
*/

function renderNetwork() {

  const svg =
    $("#network");

  svg.innerHTML = "";


  players.forEach(player => {

    player.links.forEach(targetID => {

      const target =
        players.find(
          p => p.id === targetID
        );


      const strong =
        ranks[player.id] +
        ranks[target.id] >
        0.52;


      const line =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );


      line.setAttribute(
        "x1",
        player.x
      );

      line.setAttribute(
        "y1",
        player.y
      );

      line.setAttribute(
        "x2",
        target.x
      );

      line.setAttribute(
        "y2",
        target.y
      );


      line.setAttribute(
        "class",
        "pass-line" +
        (strong ? " strong" : "")
      );


      svg.appendChild(line);

    });

  });

}


/*
=========================================
RANKING PANEL
=========================================
*/

function renderRankings() {

  const container =
    $("#rankings");

  container.innerHTML = "";


  sortedPlayers().forEach(
    (player, index) => {

      const row =
        document.createElement("div");

      row.className =
        "rank-row";


      row.innerHTML = `

        <div class="rank-no">
          ${String(index + 1).padStart(2, "0")}
        </div>

        <div>

          <div class="rank-name">

            ${player.name}

            <small>
              ${player.role}
              •
              ${player.links.length}
              outgoing links
            </small>

          </div>


          <div class="meter">

            <span
              style="
                width:
                ${Math.min(
                  ranks[player.id] * 270,
                  100
                )}%
              ">
            </span>

          </div>

        </div>


        <div class="rank-value">
          ${formatPercent(ranks[player.id])}
        </div>

      `;


      container.appendChild(row);

    }
  );


  $("#roundBadge").textContent =
    `ROUND ${round}`;

}


/*
=========================================
RENDER EVERYTHING
=========================================
*/

function render() {

  const minutes =
    Math.floor(minute / 60);

  const seconds =
    minute % 60;


  $("#minute").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


  $("#score").textContent =
    `${score[0]} — ${score[1]}`;


  renderPlayers();

  renderNetwork();

  renderRankings();

}


/*
=========================================
EVENT FEED
=========================================
*/

function addEvent(text, icon = "⚽") {

  const feed =
    $("#feed");


  const event =
    document.createElement("div");

  event.className =
    "event";


  event.innerHTML = `

    <span class="event-time">
      ${String(minute).padStart(2, "0")}'
    </span>

    <span>
      ${icon}
    </span>

    <span>
      ${text}
    </span>

  `;


  feed.prepend(event);


  while (feed.children.length > 8) {

    feed.lastChild.remove();

  }

}


/*
=========================================
TOAST
=========================================
*/

function toast(message) {

  const element =
    $("#toast");


  element.textContent =
    message;


  element.classList.add("show");


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(() => {

      element.classList.remove(
        "show"
      );

    }, 1800);

}


/*
=========================================
MOVE BALL
=========================================
*/

function moveBall(fromID, toID) {

  const from =
    players.find(
      p => p.id === fromID
    );

  const to =
    players.find(
      p => p.id === toID
    );


  const ball =
    $("#ball");


  ball.style.left =
    from.x + "%";

  ball.style.top =
    from.y + "%";


  ball.classList.remove("fly");


  void ball.offsetWidth;


  ball.style.left =
    to.x + "%";

  ball.style.top =
    to.y + "%";


  ball.classList.add("fly");


  setTimeout(() => {

    ball.classList.remove("fly");

  }, 850);

}


/*
=========================================
ONE PASS
=========================================
*/

function passOnce() {

  const source =
    players[
      Math.floor(
        Math.random() *
        players.length
      )
    ];


  const target =
    source.links[
      Math.floor(
        Math.random() *
        source.links.length
      )
    ];


  moveBall(
    source.id,
    target
  );


  addEvent(
    `<b>${source.name}</b>
     → <b>${target}</b>
     pass. Influence flows along the link.`,
    "↗"
  );

}


/*
=========================================
SIMULATE ATTACK
=========================================
*/

function simulateAttack() {

  passOnce();


  setTimeout(() => {

    const shot =
      Math.random() < 0.24;


    if (shot) {

      const team =
        Math.random() < 0.5
          ? 0
          : 1;


      score[team]++;


      addEvent(
        `<b>SHOT!</b>
         The passing chain creates
         a scoring chance.`,
        "🥅"
      );


      toast(
        "Attack completed — chance created!"
      );

    }

    else {

      addEvent(
        `<b>Build-up continues.</b>
         The network keeps circulating
         influence.`,
        "🧠"
      );

    }


    minute++;

    render();

  }, 500);

}


/*
=========================================
NEXT MINUTE
=========================================
*/

function nextMinute() {

  minute++;


  /*
    Recalculate PageRank
    every five minutes.
  */

  if (minute % 5 === 0) {

    ranks =
      calculatePageRank();


    round++;


    const leader =
      sortedPlayers()[0];


    addEvent(
      `<b>${leader.name}</b>
       is now the network leader at
       ${formatPercent(ranks[leader.id])}.`,
      "📊"
    );


    toast(
      `PageRank updated: ${leader.name} leads`
    );

  }

  else {

    passOnce();


    addEvent(
      `Possession phase.
       Current leader:
       <b>${sortedPlayers()[0].name}</b>.`,
      "🟢"
    );

  }


  render();

}


/*
=========================================
SHOW COMPLETE PASS FLOW
=========================================
*/

function showFlow() {

  const links =
    players.flatMap(
      player =>
        player.links.map(
          target => [
            player.id,
            target
          ]
        )
    );


  let index = 0;


  const flowTimer =
    setInterval(() => {

      if (index >= links.length) {

        clearInterval(
          flowTimer
        );

        return;

      }


      moveBall(
        links[index][0],
        links[index][1]
      );


      index++;

    }, 650);


  toast(
    "Every arrow represents a possible pass."
  );

}


/*
=========================================
RESET
=========================================
*/

function resetGame() {

  clearInterval(timer);

  playing = false;


  ranks = {
    A: 0.25,
    B: 0.25,
    C: 0.25,
    D: 0.25
  };


  minute = 0;

  round = 1;

  score = [0, 0];


  $("#playBtn").textContent =
    "▶ PLAY MATCH";


  $("#feed").innerHTML = "";


  addEvent(
    `<b>Kick-off.</b>
     All four players begin with
     equal PageRank: 25%.`,
    "🏁"
  );


  render();

}


/*
=========================================
PLAY / PAUSE MATCH
=========================================
*/

$("#playBtn").onclick = () => {

  if (playing) {

    clearInterval(timer);

    playing = false;

    $("#playBtn").textContent =
      "▶ PLAY MATCH";


    toast("Match paused");

    return;

  }


  playing = true;


  $("#playBtn").textContent =
    "Ⅱ PAUSE MATCH";


  timer =
    setInterval(
      nextMinute,
      1300
    );

};


/*
=========================================
BUTTONS
=========================================
*/

$("#attackBtn").onclick =
  simulateAttack;


$("#flowBtn").onclick =
  showFlow;


$("#stepBtn").onclick =
  nextMinute;


$("#resetBtn").onclick =
  resetGame;


/*
=========================================
START GAME
=========================================
*/

resetGame();
