var editor = CodeMirror(document.getElementById('cm'), {
	lineNumbers: true,
	lineWrapping: true,
	autofocus: true
});

function PrepareEditor(fileData) {
	editor.setValue(fileData.file);
}

function SetLanguageForEditor(data) {
	let ListData = parent.GetLanguageFromList();

	let path = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.29.0/mode/" + ListData.language + "/" + ListData.language + ".min.js";

	let old = document.getElementById('mime');
	if (old) {
		old.parentElement.removeChild(old);
	}

	let s = document.createElement("script");
	s.type = "text/javascript";
	s.src = path;
	s.innerHTML = null;
	s.id = "mime";
	document.getElementsByTagName('head')[0].appendChild(s);

	setTimeout(function () {
		editor.setOption('mode', data.mime);
	}, 600);
}

parent.InitEditor(function (data) {
	PrepareEditor(data);
	SetLanguageForEditor(data);
});

editor.on("change", function (event, objChange) {
	if (objChange.origin) {
		parent.SendObjToActivePeer({
			type: 'edit',
			message: objChange
		});
	}
});

function passDataToEditor(data) {
	editor.doc.replaceRange(data.text, {
		line: data.from.line,
		ch: data.from.ch
	}, {
		line: data.to.line,
		ch: data.to.ch
	});
}

function GetDataFromEditor() {
	return editor.getValue();
}