$(document).ready(function() {
  $("#add-player").click(function() {
    $("#player-name").val() // this is the player name entered into the text field
    var playerName = $("#player-name").val();

    if(playerName == "") {
      alert("Please enter a name");
    } else {
      $("#player-name").val("");

      // copy the player template column
      var playerContainer = $("#player-template").clone();

      // unhide the template
      playerContainer.removeClass("hide");

      // inject the template into the page
      $(".players").append(playerContainer);

      // put player's name into the template
      playerContainer.find(".player-name").html(playerName);

      if($(".player-container").length > 2) {
        $("#start-button").removeClass("hide");
      }
    }
  });

  $(".active-player").click(function() {
    $(".player-container").removeClass("active");

    $(this).closest(".player-container").addClass("active");
  });

  $("#start-button").click(function() {
    $(".player-container:first").addClass("active");
  });
});