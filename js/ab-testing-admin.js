jQuery('document').ready(function() {

var $ = jQuery,
	ab = {

	newTest: $('#new_test'),
	closeTest: $('#close_new'),
	testData: $('#test_data'),
	newData: $('#test_data div.new_data'),
	inputWrapper: $('#input_wrapper'),
	testTable: $('#test_table'),
	cellWrap: {},
	versWrap: {},
	inputClone: {},
	addVers: {},
	button_wrap: {},
	saveTest: {},
	verName: {},
	testErrors: {},
	codeInput: {},
	nInputs: 2,
	tests: {
		tstName: '',
		verName: [],
		tstCode: []
	},
	inputErrors: {
		testName: true
	},
	winnerSet: [],

	init: function() {
		this.initAllTests();
		// clone html inputs and then remove
		this.inputClone = this.newData.clone();
		this.newData.remove();
		this.cellWrap = this.testTable.find('div.cell_wrapper').clone();
		this.versWrap = this.testTable.find('div.version_wrap').clone();
		$('div.cell_wrapper').remove();
		// clone html for test table and remove

		this.newTestClick();
		this.closeTestClick();
	},

	initAllTests: function() {

		this.getAllTests();
	},

	getAllTests: function() {

		ab.ajaxRequest({
			url: pageLocalData.ajaxurl,
			data: {
				action: 'get_all_tests',
				nonce: pageLocalData.nonce
			},
			callBack: ab.getAllTestsCallback,
			dataType: 'json'
		});
	},

	getAllTestsCallback: function(r) {
		ab.createTestsTable(r);
	},

	createTestsTable: function(tst) {
		this.buildTableCells(tst);
		this.buildVersions(tst);
		this.setTestName(tst);
		this.setTimeStarted(tst);
		this.setTimeStoped(tst);
		this.setVersNames(tst);
		this.setVersCode(tst);
		this.setWinnerInput(tst);
		this.setToggleWinner(tst);
		this.setTrashClick(tst);
		this.setActiveInput(tst);
		this.setActiveClick(tst);
		this.setStopInput(tst);
		this.setStopClick(tst);
	},

	buildTableCells: function(tst) {
		for (var i = 0; i < tst.length; i++) {
			this.testTable.append(this.cellWrap.clone());
		}

		this.cellWrap = this.testTable.find('div.cell_wrapper');
	},

	buildVersions: function(tst) {

		$('div.version_wrap').remove();

		for (var i = 0; i < tst.length; i++) {

			for (var j = 0; j < tst[i].versions.length; j++) {
				this.cellWrap.eq(i).append(this.versWrap.clone())
			}
		}
	},

	setTestName: function(tst) {
		var testName = this.testTable.find('p.test_name');
		for (var i = 0; i < tst.length; i++) {
			testName.eq(i).text(tst[i].test_name);
		}
	},

	setTimeCreated: function(tst) {
		var testName = this.testTable.find('p.time_created');

		for (var i = 0; i < tst.length; i++) {
			testName.eq(i).text(this.createDate(tst[i].time_created));
		}
	},

	setTimeStarted: function(tst) {
		var testName = this.testTable.find('p.time_start'),
			txt = '';

		for (var i = 0; i < tst.length; i++) {
			if (tst[i].time_start == '0') {
				txt = 'Draft';
			} else {
				txt = this.createDate(tst[i].time_start);
			}
			testName.eq(i).text(txt);
		}	
	},

	setTimeStoped: function(tst) {
		var testName = this.testTable.find('p.time_stop'),
			txt = '';

		for (var i = 0; i < tst.length; i++) {
			if (tst[i].time_start == '0' && tst[i].time_stop == '0') {
				txt = 'Draft';
			} else if (tst[i].time_start != '0' && tst[i].time_stop == '0') {
				txt = 'Running';
			} else {
				txt = this.createDate(tst[i].time_stop);
			}
			testName.eq(i).text(txt);
		}	
	},

	createDate: function(int) {
		var dt = new Date(1000*int),
			day = dt.getDate(),
			mnt = dt.getMonth(),
			yr = dt.getFullYear() - 2000;
		dt = mnt + '/' + day + '/' + yr;
		return dt;
	},

	setVersNames: function(tst) {
		var versName = this.testTable.find('p.vers_name'),
			vers_index = 0;

		for (var i = 0; i < tst.length; i++) {

			for (var j = 0; j < tst[i].versions.length; j++) {
				versName.eq(vers_index).text(tst[i].versNames[j]);
				vers_index++;
			}
		}
	},

	setVersCode: function(tst) {
		var versCode = this.testTable.find('textarea.version_code'),
			vers_index = 0;

		for (var i = 0; i < tst.length; i++) {

			for (var j = 0; j < tst[i].versions.length; j++) {
				versCode.eq(vers_index).text(tst[i].versions[j]);
				vers_index++;
			}
		}
	},

	setWinnerInput: function(tst) {
		var wrappers = this.testTable.find('div.cell_wrapper'),
			inputs = [],
			winner = 0;

		// iterate over cell wrappers to get input groups
		for (var i = 0; i < wrappers.length; i++) {
			inputs[i] = wrappers.eq(i).find('input.set_winner');
		}

		for (var i = 0; i < tst.length; i++) {
			winner = 1 * tst[i].winner;
			if (winner > 0) {
				inputs[i].eq(winner - 1)[0].checked = true;
			}
		}
	},

	setToggleWinner: function(tst) {
		var winner = this.testTable.find('input.set_winner');

		winner.unbind('click');
		winner.click(function() {
			var self = $(this),
				wrappers = ab.testTable.find('div.cell_wrapper'),
				parent = self.parents('div.cell_wrapper'),
				parent_index = parent.index('div.cell_wrapper'),
				siblings = wrappers.eq(parent_index).find('input.set_winner'),
				self_index = siblings.index(self),
				checked = self.attr('checked'),
				isSet = false;

			if (self[0].checked) {

				// toggle checkboxes
				for (var i = 0; i < siblings.length; i++) {
					siblings[i].checked = false;
				}

				self[0].checked = true;

				ab.setWinner({
					action: 'set',
					test_index: parent_index,
					vers_index: self_index,
					alltests: tst
				});
				
			} else {
				ab.setWinner({
					action: 'unset',
					test_index: parent_index,
					vers_index: self_index,
					alltests: tst
				});
			}
		});
	},

	setWinner: function(w) {
		var test_name = w.alltests[w.test_index].test_name,
			vers_id = w.vers_index + 1,
			winner = 0;

		winner = (w.action == 'set') ? 1 : 0;
		
		if (ab.confirmAction('Confirm winner toggle')) {
			ab.ajaxRequest({
				url: pageLocalData.ajaxurl,
				data: {
					action: 'set_version_winner',
					nonce: pageLocalData.nonce,
					winner: winner,
					test_name: test_name,
					vers_id: vers_id
				},
				callBack: ab.setWinnerCallback,
				dataType: 'json'
			});
			return true;
		} else {
			return false;
		}
	},

	setWinnerCallback: function(r) {},

	setTrashClick: function(tst) {
		var trash = this.testTable.find('button.trash_this');

		trash.click(function() {
			var self = $(this),
				index = self.index('button.trash_this'),
				parent = self.parents('div.cell_wrapper'),
				d = new Date() / 1000,
				test_name = '',
				time_stop = (tst[index].time_stop === 0) ? Math.round(d) : 0;

			test_name = tst[index].test_name;

			if (ab.confirmAction('Are you sure you want to trash this test?')) {
				parent.remove();
				ab.ajaxRequest({
					url: pageLocalData.ajaxurl,
					data: {
						action: 'set_trash_test',
						nonce: pageLocalData.nonce,
						test_name: test_name,
						time_stop: time_stop
					},
					callBack: ab.setTrashCallback,
					dataType: 'json'
				});
			}
		});
	},

	setTrashCallback: function(r) {},

	setActiveInput: function(tst) {
		this.activeTest = this.testTable.find('input.test_active');
		for (var i = 0; i < tst.length; i++) {
			if (1 * tst[i].active === 1 ) {
				this.activeTest.eq(i)[0].checked = true;
			}
		}
	},

	setActiveClick: function(tst) {
		var startDate = this.testTable.find('p.time_start');

		this.activeTest.click(function() {
			var self = $(this),
				index = self.index('input.test_active'),
				msg = '',
				testActive = 0,
				d = new Date() / 1000,
				test_name = '',
				time_start = (tst[index].time_start === 0) ? Math.round(d) : 0;

			test_name = tst[index].test_name;
			
			if (self[0].checked) {
				msg = 'Is this test ready to be started?';
				testActive = 1;
			} else {
				msg = 'Are You sure you want to pause this Test?';
				testActive = 0;
			}

			if (ab.confirmAction(msg)) {
				startDate.eq(index).text(ab.createDate(d));
				ab.ajaxRequest({
					url: pageLocalData.ajaxurl,
					data: {
						action: 'set_test_active',
						nonce: pageLocalData.nonce,
						test_name: test_name,
						test_active: testActive,
						time_start: time_start
					},
					callBack: ab.testActiveCallback,
					dataType: 'json'
				});
			}
		});
	},

	testActiveCallback: function(r) {},

	setStopInput: function(tst) {
		var allInputs = {};
		this.stopTest = this.testTable.find('input.test_stop');
		for (var i = 0; i < tst.length; i++) {
			// if test is set to stop
			if (1 * tst[i].stop === 1 ) {
				this.stopTest.eq(i)[0].checked = true;

				// disable all sibling inputs
				allInputs = this.stopTest.eq(i)
					.parents('div.cell_wrapper')
					.find('input');

				for (var j = 0; j < allInputs.length; j++) {
					allInputs.eq(j)[0].disabled = true;
				}
			}
		}
	},

	setStopClick: function(tst) {
		var stopDate = this.testTable.find('p.time_stop');

		this.stopTest.click(function() {
			var self = $(this),
				index = self.index('input.test_stop'),
				parents = self.parents('div.cell_wrapper'),
				siblings = parents.find('input'),
				msg = '',
				testStop = 0,
				d = new Date() / 1000,
				test_name = '',
				time_stop = (tst[index].time_stop === 0) ? Math.round(d) : 0;

			test_name = tst[index].test_name;

			if (self[0].checked) {
				msg = 'Are you sure you want to stop this test? This will delete Test Cookies and the test cannot be restarted!';
				testStop = 1;
			}

			if (ab.confirmAction(msg)) {

				// disable all inputs for test
				for (var i = 0; i < siblings.length; i++) {
					siblings.eq(i)[0].disabled = true;
				}
				// update stop date
				stopDate.eq(index).text(ab.createDate(d));

				ab.ajaxRequest({
					url: pageLocalData.ajaxurl,
					data: {
						action: 'set_test_stop',
						nonce: pageLocalData.nonce,
						test_name: test_name,
						time_stop: time_stop
					},
					callBack: ab.testStopCallback,
					dataType: 'json'
				});
			}
		});
	},

	testStopCallback: function(r) {},

	confirmAction: function(msg) {
		if(window.confirm(msg)) {
			return true;
		}

		return false;
	},

	newTestClick: function() {
		this.newTest.click(function() {
			ab.inputWrapper.css('display', 'block');
			ab.initDataInputs();
		});
	},

	closeTestClick: function() {
		this.closeTest.click(function() {
			ab.inputWrapper.css('display', 'none');
		});
	},

	initDataInputs: function() {
		this.createInputs();
		this.bindTestName();
		this.bindVersionName();
		this.populateVerName();
		this.bindTestCode();
		this.populateTestCode();
		this.verSaveButtons();
		this.deleteVers();
		this.versionNums();
	},

	createInputs: function() {
		this.newData.remove();

		for (var i = 0; i < this.nInputs; i++) {
			this.testData.append(this.inputClone.clone());	
		}

		// re dim for later removal
		this.newData = $('#test_data div.new_data');
	},

	bindTestName: function() {
		var testName = $('#test_name');
		testName.unbind('change');
		testName.change(function() {
			var self = $(this),
				val = self.val();
			ab.exsitingNameCheck(val);
			ab.tests.tstName = val;
		});
	},

	exsitingNameCheck: function(n) {
		ab.ajaxRequest({
			url: pageLocalData.ajaxurl,
			data: {
				action: 'exsiting_name_check',
				nonce: pageLocalData.nonce,
				name: n
			},
			callBack: ab.exsitingNameCallback,
			dataType: 'json'
		});
	},

	exsitingNameCallback: function(r) {
		var err = $('#test_name_error');
		if (r[0]) {
			ab.inputErrors.testName = false;
			err.css('display', 'none');
		} else {
			ab.inputErrors.testName = true;
			err.css('display', 'block');
		}
	},

	bindVersionName: function() {
		this.verName = this.testData.find('input.version_name');

		this.verName.unbind('change');
		this.verName.change(function() {
			var self = $(this),
				index = ab.testData.find(self).index('input.version_name');
			ab.tests.verName[index] = self.val();
		});
	},

	populateVerName: function() {

		for (var i = 0; i < this.tests.verName.length; i++) {
			this.verName.eq(i).val(this.tests.verName[i]);
		}
	},

	bindTestCode: function() {
		this.codeInput = this.testData.find('textarea.code_input');

		this.codeInput.unbind('change');
		this.codeInput.change(function() {
			var self = $(this),
				index = ab.testData.find(self).index('textarea.code_input');
			ab.tests.tstCode[index] = self.val();
		});
	},

	populateTestCode: function() {

		for (var i = 0; i < this.tests.tstCode.length; i++) {
			this.codeInput.eq(i).val(this.tests.tstCode[i]);
		}
	},

	verSaveButtons: function() {

		var html = '';

		if (this.button_wrap.length > 0) {
			this.button_wrap.remove();
		}

		if (this.addVers.length > 0) {
			this.addVers.remove();
		}

		if (this.saveTest.length > 0) {
			this.saveTest.remove();
		}

		if (this.testErrors.length > 0) {
			this.testErrors.remove();
		}

		html += '<div id="button_wrap" class="row"></div>';
		html +=		'<div class="small-6 columns">';
		html +=			'<button id="add_vers" class="small secondary">Add Version</button>';
		html +=		'</div>';
		html +=		'<div class="small-6 columns text-right">';
		html +=			'<button id="save_test" class="small">Save Test</button>';
		html +=			'<p id="new_test_errors" class="error">You Have Input Errors</p>';
		html +=		'</div>';
		html += '</div>';

		this.testData.append(html);
		this.bindSaveButtons();
	},

	bindSaveButtons: function() {
		this.testErrors = $('#new_test_errors');
		this.button_wrap = $('#button_wrap');
		this.addVers = $('#add_vers');
		this.saveTest = $('#save_test');

		this.addVers.click(function() {
			ab.nInputs++;
			ab.initDataInputs();
		});

		this.saveTest.click(function() {
			var self = $(this);
			if (ab.noInputErrors()) {
				self.remove();
				ab.saveTestData(ab.tests);
				ab.testErrors.css('display', 'none');
			} else {
				ab.testErrors.css('display', 'block');
			}
		});
	},

	noInputErrors: function() {
		for (key in this.inputErrors) {
			if (this.inputErrors[key]) {
				return false;
			}
		}
		return true;
	},

	saveTestData: function(tests) {
		tests = JSON.stringify(tests);
		ab.ajaxRequest({
			url: pageLocalData.ajaxurl,
			data: {
				action: 'upload_test_data',
				nonce: pageLocalData.nonce,
				tests: tests
			},
			callBack: ab.saveTestDataCallback,
			dataType: 'json'
		});
	},

	saveTestDataCallback: function(r) {
		ab.inputWrapper.css('display', 'none');
		window.location.reload(true);
	},

	deleteVers: function() {
		var delVer = this.testData.find('button.delete_ver');

		delVer.click(function() {
			var self = $(this),
				index = ab.testData.find(self).index('button.delete_ver');
			ab.tests.verName.splice(index, 1);
			ab.tests.tstCode.splice(index, 1);
			ab.nInputs--;
			ab.initDataInputs();
		});
	},

	versionNums: function() {
		var nums = this.testData.find('span.ver_num');

		for (var i = 0; i < nums.length; i++) {
			nums.eq(i).text(i + 1);
		}
	},

	ajaxRequest: function( request ) {
		// ajaxRequest({
		// 	url: "models/trading-test.php",
		// 	data: testResult,
		// 	callBack: loadTestConfirm
		// });
		var ax = {};
		ax.response = "ajax-response";
		ax.type = "POST";
		ax.url = request.url;
		ax.data = request.data;
		ax.global = false;
		ax.timeout = 30000;
		if ( typeof request.dataType !== 'undefined') {
			ax.dataType = request.dataType;
		}
		ax.success = function(r) {
			if (typeof request.callBack !== 'undefined') {
				request.callBack(r);
			}
		};
		ax.error = function(r) {};
		// AJAX Request
		jQuery.ajax(ax);
	},
};

ab.init();

});