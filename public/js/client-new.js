$(function () {
  $(".lang-switcher__current").click(function () {
    $(this).closest(".lang-switcher").toggleClass("lang-switcher--active");
  });

  // close installment-modal
  $(".installment-modal__close").click(function () {
    $(this).closest(".installment-modal").fadeOut(300);
  });

  $("#checkbox").change(function () {
    if (this.checked) {
      $("#submit").removeAttr("disabled");
    } else {
      $("#submit").attr("disabled", true);
    }
  });
});

function showInstallmentModal() {
  $(".installment-modal").fadeIn(300);
}
