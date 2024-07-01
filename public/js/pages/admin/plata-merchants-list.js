var $ = jQuery.noConflict();

$(document).ready(function () {
	var table = $("#table_merchants").DataTable({
		ajax           : {
			url: "/admin/plata-merchants/list"
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
			}
		],
		order          : [0, "asc"],
		select         : true,
		"fnRowCallback": function (nRow, aData, iDisplayIndex) {
			nRow.setAttribute("id", aData[0]);

			nRow.lastChild.innerHTML = "";

			//Edit btn
			var aTag = document.createElement("a");
			aTag.setAttribute("title", "Редактировать");
			aTag.setAttribute("style", "cursor:pointer; margin-right:5px");
			aTag.onclick = function () {
				editItem(aData[2]);
			};

			var iTag = document.createElement("i");
			iTag.setAttribute("class", "fa fa-pencil");
			aTag.appendChild(iTag);

			nRow.lastChild.appendChild(aTag);

			//Remove btn
			aTag = document.createElement("a");
			aTag.setAttribute("title", "Удалить");
			aTag.setAttribute("style", "cursor:pointer");
			aTag.onclick = function () {
				deleteItem(aData[2]);
			};

			iTag = document.createElement("i");
			iTag.setAttribute("class", "fa fa-trash-o");
			aTag.appendChild(iTag);

			nRow.lastChild.appendChild(aTag);
		},
		aLengthMenu    : [
			[10, 25, 50, 100, 200],
			[10, 25, 50, 100, 200]
		],
		iDisplayLength : 200
	});

	function editItem(id) {
		window.location = "/admin/plata-merchants/" + id + "/edit";
	}

	function deleteItem(selectedId) {
		Dialog("Удалить запись?", function () {
			deleteItemBack(selectedId);
		}, function () {
			return false;
		});
	}

	function deleteItemBack(id) {
		if (!window.location.origin) {
			window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
		}

		$.get(window.location.origin + "/admin/plata-merchants/" + id + "/delete", function (resp) {
			if (resp.result) {
				table.ajax.reload();
			} else {
				if (resp.error) {
					setError(resp.error);
				}
			}
		});
	}
});
