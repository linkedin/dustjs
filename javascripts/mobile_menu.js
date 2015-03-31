
$(document).ready(function () {
  var $expandButton = $("#expand-mobile");

  $expandButton.on("click", function(event) {
    event.preventDefault();
    $expandButton.toggleClass("active")
    $("nav").toggleClass("expanded");
  });
})
