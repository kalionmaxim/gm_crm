var $ = jQuery.noConflict();

$(document).ready(function () {
	var table = $("#table_orders").DataTable({
		serverSide     : true,
		processing     : true,
		ajax           : {
			url: "/admin/orders/privat/list"
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
			}
		],
		order          : [0, "asc"],
		select         : true,
		aLengthMenu    : [
			[10, 25, 50, 100, 200],
			[10, 25, 50, 100, 200]
		],
		iDisplayLength : 50
	});
});
