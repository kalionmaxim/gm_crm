$(document).ready(function () {
	//Check

	if ($(window).width() > 1000) {
		wow = new WOW(
			{
				animateClass: "animated",
				offset      : 100
			}
		);
		wow.init();
	}

});

// cookie script
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(";");
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == " ") c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

function clearF1Cookie() {
	setCookie("name", "", -1);
	setCookie("email", "", -1);
	setCookie("last1", "", -1);
}

$(window).load(function () {
	$("input.name").val(getCookie("name"));
	$("input.email").val(getCookie("email"));
	$("input.phone").val(getCookie("phone"));
	$("input.phone1").val(getCookie("phone1"));
	$("input.phone2").val(getCookie("phone2"));
	$("input.phone3").val(getCookie("phone3"));
});

$(window).load(function () {
	$.getJSON("https://freegeoip.net/json/", function (data) {
		var country = data.country_code;
		if (country != "UA") {
			(function (w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
				var f = d.getElementsByTagName(s)[0], j = d.createElement(s),
					dl = l != "dataLayer" ? "&l=" + l : "";
				j.async = true;
				j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
				f.parentNode.insertBefore(j, f);
			})(window, document, "script", "dataLayer", "GTM-5JMBF4G");
		}

		if (getCookie("phone")) {
			$("#phone").val(getCookie("phone"));
		} else if (country === "UA") {
			$("#phone").val("+380");
		} else if (country === "RU") {
			$("#phone").val("+7");
		} else {
			var countryData = $("#phone").intlTelInput("getSelectedCountryData");
			var dialCode = countryData.dialCode;
			$("#phone").val("+" + dialCode);
		}
	});
});

$(".check label").on("click", function () {
	var button = $(".sec2 form input[type=\"submit\"]");
	if ($("#checkbox").prop("checked")) {
		$(".check label").removeClass("active");
		button.addClass("disable");
	} else {
		$(".check label").addClass("active");
		button.removeClass("disable");
	}
});

