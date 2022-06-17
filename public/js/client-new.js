$(function () {
  $(".lang-switcher__current").click(function () {
    $(this).closest(".lang-switcher").toggleClass("lang-switcher--active");
  });

  // close installment-modal
  $(".installment-modal__close").click(function () {
    $(this).closest(".installment-modal").fadeOut(300);
  });

  // change lang
  var currentLang = getParameterByName("lang").toLowerCase() || "ru";
  $(".lang-switcher__current").text(currentLang.toUpperCase());

  switch (currentLang) {
    case "ru":
      $(".lang-switcher-list__item")
        .text("UA")
        .attr(
          "href",
          updateURLParameter(window.location.href, "lang", "ua")
        );
      break;
    case "ua":
      $(".lang-switcher-list__item")
        .text("RU")
        .attr(
          "href",
          updateURLParameter(window.location.href, "lang", "ru")
        );
      break;
  }

  $("#checkbox").change(function () {
    if (this.checked) {
      $("#submit").removeAttr("disabled");
    } else {
      $("#submit").attr("disabled", true);
    }
  });
});

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function updateURLParameter(url, param, paramVal) {
  var newAdditionalURL = "";
  var tempArray = url.split("?");
  var baseURL = tempArray[0];
  var additionalURL = tempArray[1];
  var temp = "";
  if (additionalURL) {
    tempArray = additionalURL.split("&");
    for (var i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split("=")[0] != param) {
        newAdditionalURL += temp + tempArray[i];
        temp = "&";
      }
    }
  }

  var rows_txt = temp + "" + param + "=" + paramVal;
  return baseURL + "?" + newAdditionalURL + rows_txt;
}
