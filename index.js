class Farkle {
  static lastScore = 0;
  static gameStarted = false;
  static finalRound = false;
  static playSounds = false; // make true when done developing
  static playedFinalRoundSound = false;
  static partyMode = false;

  static initialize() {
    this.buttonFor("addPlayer").click(this.addPlayer);
    this.buttonFor("startGame").click(this.startGame);
    this.buttonFor("playerFarkle").click(function() {
      Farkle.playSound("farkle");
      $(`[data-farkle-element="turnScore"]`).val("");
      Farkle.lastScore = 0;
      Farkle.nextTurn();
    });

    this.players = [];
  }

  static playSound(filename) {
    if(!this.playSounds) {
      return;
    }

    var audio = new Audio(`sounds/${filename}.mp3`);

    audio.play();
  }

  static addPlayer() {
    let playerName = Farkle.valueFor("playerName");

    if(playerName == "") {
      alert("Please enter a name");

      return;
    }

    Farkle.elementFor("playerName").val("");

    let player = new FarklePlayer(playerName);
    Farkle.players.push(player);
    player.render();

    if(Farkle.players.length > 1) {
      Farkle.buttonFor("startGame").removeClass("hide");
    }
  }

  static startGame() {
    Farkle.playSound("start");
    Farkle.elementFor("addPlayersContainer").addClass("hide");
    $(`[data-farkle-button="playerFarkle"]`).removeClass("hide");
    Farkle.gameStarted = true;

    Farkle.players[0].turn = true;
    Farkle.update();
  }

  static nextTurn() {
    let currentTurn = Farkle.players.findIndex(player => player.turn);
    let nextPlayer;

    Farkle.players[currentTurn].turn = false;

    if(Farkle.finalRound) {
      Farkle.players[currentTurn].endgame = true;
    }

    if(currentTurn == Farkle.players.length - 1) {
      nextPlayer = Farkle.players[0];
    } else {
      nextPlayer = Farkle.players[currentTurn + 1];
    }

    if(Farkle.finalRound && nextPlayer.endgame) {
      let winner = Farkle.players.reduce((highest, player) => {
        if(player.totalScore() > highest.totalScore()) {
          return player;
        } else {
          return highest;
        }
      }, Farkle.players[0]);

      Farkle.playSound("end");
      setTimeout(() => {
        alert(`Game over! ${winner.name} wins!`);
      }, 2000);
    } else {
      nextPlayer.turn = true;
    }

    Farkle.update();
  }

  static update() {
    Farkle.elementFor("lastScore").html(this.lastScore);

    let everyoneHasScored = Farkle.players.every(player => player.scores.length > 0);

    if(everyoneHasScored) {
      Farkle.elementFor("lastScoreWrapper").removeClass("hide");
    } else {
      Farkle.elementFor("lastScoreWrapper").addClass("hide");
    }

    Farkle.players.forEach(player => {
      player.update();
    });
  }

  static buttonFor(name) {
    return $(`[data-farkle-button="${name}"]`);
  }

  static elementFor(name) {
    return $(`[data-farkle-element="${name}"]`);
  }

  static valueFor(name) {
    return this.elementFor(name).val();
  }
}

class FarklePlayer {
  constructor(name) {
    this.name = name;
    this.scores = [];
    this.container;
    this.turn = false;
    this.endgame = false;
    this.crossed9000 = false;
  }

  render() {
    this.container = FarklePlayer.template();
    this.container.data("farkle-player", this);
    
    this.container.removeClass("hide");
    this.container.removeAttr("id");
    this.container.removeAttr("data-farkle-element");
    this.container.find(`[data-farkle-element="playerName"]`).html(this.name);
    this.container.find(`[data-farkle-button="addPlayerScore"]`).click(function() {
      FarklePlayer.addScore(this);
    });

    this.container.find(`[data-farkle-button="removePlayer"]`).click(function() {
      let confirmation = confirm("Are you sure you want to remove this player?");

      if(!confirmation) {
        return;
      }

      let player = $(this).closest(".player-container").data("farkle-player");
      let index = Farkle.players.indexOf(player);

      Farkle.players.splice(index, 1);
      player.container.remove();
    });

    Farkle.elementFor("playersContainer").append(this.container);
  }

  update() {
    this.container.find(`[data-farkle-element="playerScore"]`).html(this.totalScore());

    if(this.totalScore() >= 9000 && !this.crossed9000) {
      this.container.find(`[data-farkle-element="playerScore"]`).addClass("red");
      this.crossed9000 = true;
    }

    if(this.endgame) {
      this.container.find(`[data-farkle-element="scoreLabel"]`).html("Final Score:");
    }

    if(Farkle.finalRound) {
      if(!Farkle.playedFinalRoundSound) {
        Farkle.playSound("final_round");
        Farkle.playedFinalRoundSound = true;
      }

      let highestScore = Farkle.players.reduce((highest, player) => {
        if(player.totalScore() > highest) {
          return player.totalScore();
        } else {
          return highest;
        }
      }, 0);

      if(this.totalScore() < highestScore) {
        let pointsNeededToWin = (highestScore - this.totalScore()) + 50;

        this.container.find(`[data-farkle-element="pointsNeededToWin"]`).parent().removeClass("hide");
        this.container.find(`[data-farkle-element="pointsNeededToWin"]`).removeClass("hide").html(pointsNeededToWin);
      }
    }

    if(Farkle.gameStarted) {
      this.container.find(`[data-farkle-element="turnScore"]`).removeClass("hide");
      this.container.find(`[data-farkle-button="addPlayerScore"]`).removeClass("hide");
      this.container.find(`[data-farkle-element="playerScore"]`).parent().removeClass("hide");
    }

    if(this.scores.length > 0) {
      this.container.find(`[data-farkle-element="playerScoreHistoryList"]`).html("");
      this.scores.forEach(score => {
        this.container.find(`[data-farkle-element="playerScoreHistoryList"]`).append(`<li>${score}</li>`);
      });
    }

    if(this.turn) {
      this.container.addClass("active");
      this.container.find(`[data-farkle-element="turnScore"]`).attr("disabled", false);
      this.container.find(`[data-farkle-button="addPlayerScore"]`).attr("disabled", false);
    } else {
      this.container.removeClass("active");
      this.container.find(`[data-farkle-element="turnScore"]`).attr("disabled", true);
      this.container.find(`[data-farkle-button="addPlayerScore"]`).attr("disabled", true);
    }
  }
  
  static addScore(button) {
    let player = $(button).closest(".player-container").data("farkle-player");
    let score = player.container.find(`[data-farkle-element="turnScore"]`).val();

    if(score == "") {
      return;
    }

    if(score % 50 != 0) {
      alert("Invalid score - do you even math, bro?");

      return;
    } else {
      if(player.scores.length == 0 && score < 500) {
        alert("First score must be at least 500 - size matters!");
      } else {
        player.scores.push(parseInt(score));
        Farkle.lastScore = parseInt(score);

        if(player.totalScore() >= 10000) {
          player.endgame = true;
          Farkle.finalRound = true;
        }

        player.container.find(`[data-farkle-element="turnScore"]`).val("");
        Farkle.nextTurn();
      }
    }
  }

  totalScore() {
    return this.scores.reduce((total, score) => total + score, 0);
  }

  static template() {
    return $("#player-template").clone();
  }
}

$(document).ready(function() {
  $(".flyout .handle").click(function() {
    $(".flyout").toggleClass("open");
  });

  $("#togglePlayerDeletion").change(function() {
    if(this.checked) {
      $(".remove-player").removeClass("hide");
    } else {
      $(".remove-player").addClass("hide");
    }
  });

  $("#togglePlayerScoreHistory").change(function() {
    if(this.checked) {
      $(`[data-farkle-element="playerScoreHistory"]`).removeClass("hide");
    } else {
      $(`[data-farkle-element="playerScoreHistory"]`).addClass("hide");
    }
  });

  $("#toggleSounds").change(function() {
    Farkle.playSounds = this.checked;
  });

  $("#togglePartyMode").change(function() {
    if(this.checked) {
      Farkle.partyMode = setInterval(function() {
        $("*").each(function() {
          var randomColor = Math.floor(Math.random()*16777215).toString(16);
          $(this).css("background-color", `#${randomColor}`);
  
          var randomColor = Math.floor(Math.random()*16777215).toString(16);
          $(this).css("color", `#${randomColor}`);
        });
      }, 1000);
    } else {
      clearInterval(Farkle.partyMode);
    }
  });
});