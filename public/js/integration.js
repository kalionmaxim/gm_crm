function searchContactOrAddNew(data) {
	axios({
		method: "post",
		url   : "/contact",
		data  : data
	}).then(function (response) {
		console.log(response);
	});
}
