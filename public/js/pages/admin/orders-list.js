var $ = jQuery.noConflict();

$(document).ready(function () {
	const $monoReturnDialog = $("#monoReturn");

	var table = $("#table_orders").DataTable({
		serverSide     : true,
		processing     : true,
		ajax           : {
			url: "/admin/orders/list"
		},
		columnDefs     : [
			{
				targets   : 0,
				searchable: false,
				orderable : false
			},
			{
				targets   : 1,
				searchable: false,
				orderable : false
			},
			{
				targets   : 2,
				searchable: false,
				orderable : false
			},
			{
				targets   : 3,
				searchable: false,
				orderable : false
			},
			{
				targets   : 4,
				searchable: true,
				orderable : false
			},
			{
				targets   : 5,
				searchable: true,
				orderable : false
			},
			{
				targets   : 6,
				searchable: true,
				orderable : false
			},
			{
				targets   : 7,
				searchable: true,
				orderable : false
			},
			{
				targets   : 8,
				searchable: true,
				orderable : false
			}
		],
		order          : [0, "asc"],
		select         : true,
		"fnRowCallback": function (nRow, aData, iDisplayIndex) {
			nRow.setAttribute("id", aData[0]);

			nRow.lastChild.innerHTML = "";

			//Return btn
			var aTag = document.createElement("a");
			aTag.setAttribute("title", "Сделать возврат");
			aTag.setAttribute("style", "cursor:pointer; margin-right:5px");
			aTag.onclick = function () {
				returnItem(aData[0]);
			};

			var iTag = document.createElement("i");
			iTag.setAttribute("class", "fa fa-history");
			aTag.appendChild(iTag);

			nRow.lastChild.appendChild(aTag);
		},
		aLengthMenu    : [
			[10, 25, 50, 100, 200],
			[10, 25, 50, 100, 200]
		],
		iDisplayLength : 50
	});

	function returnItem(id) {
		$("#monoReturnOrderId").val(id);
		$monoReturnDialog.fadeIn(300);
		// Dialog("Сделать возврат?", function () {
		// 	window.location = `/admin/orders/${id}/return`;
		// }, function () {
		// 	return false;
		// });
	}

	$('#monoReturn .button-no').click(function () {
		$monoReturnDialog.fadeOut(300);
	});

	$('#monoReturnForm').submit((e) => {
		e.preventDefault();

		const id = $('#monoReturnOrderId').val();
		const returnSum = Number($('#monoReturnSum').val());

		if (returnSum <= 0) return alert("Сума повернення має бути більше 0");

		if (id && returnSum) {
			axios({
				method: "get",
				url   : `/admin/orders/${id}/return/${returnSum}`,
				data  : data
			}).then(function (response) {
				console.log(response);
				if (response && response.data && response.data.result && response.data.data) {
					console.log(response);
					window.location.reload();
				} else {
					alert("Невідома помилка");
				}
			});
		} else {
			alert("Будь ласка заповніть всі поля або перезавантажте сторінку");
		}
	})
});
