var $ = jQuery.noConflict();

$(document).ready(function () {
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
		Dialog("Сделать возврат?", function () {
			window.location = "/admin/orders/" + id + "/return";
		}, function () {
			return false;
		});
	}
});
