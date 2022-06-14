$(function () {
  $(".lang-switcher__current").click(function () {
    $(this).closest(".lang-switcher").toggleClass("lang-switcher--active");
  });
});
