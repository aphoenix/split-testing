# Wordpress A/B split-testing

### Description

A plugin for A/B split-testing html elements with javascript.  JQuery is required.

### Requirements
	- General Wordpress Installation
	- Google Analytics
	- jQuery - available to your admin and client side
	- ability to set file and folder permissions on your server
	- Do not run more than 5 A/B tests per visitor session. Otherwise analytics data will be overwritten

### Installation
	- Copy the files from this repo to your server directory `/wp-content/plugins/`
	- In wp-admin, navigate to Plugins and activate 'A/B Split Testing'

### Javascript
	- After your first test is created, you must globably link to the plugin file `js/ab.js` in your wordpress theme.
	- This plugin does not load any external libraries.
	- [jQuery Cookie](https://raw.github.com/carhartl/jquery-cookie/) is included in the `js/ab.js` file.
	- You must load [jQuery](http://jquery.com/) in your wordpress theme to support the jQuery Cookie library.
	- You can load and use any other javascript library you requgire for your theme and use that library in your A/B tests to manipulate DOM elements during tests.

### Google Analytics
	- This plugin uses google analytics to store test data.
	- Data stored is set with custom variables on session level events.
	- Data stored is Test Name and Test Version
	- It is up to you, the webmaster or analytics admin, to set the test goals in your analytics admin settings.

Here's further reading about Google Analytics [Custom Variables](https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCustomVariables), [Analytics Events](https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide), and [Analytics Goals](https://support.google.com/analytics/answer/1032415?hl=en).

When a visitor views a page with a given test running, we use "Session Level" events to track the test view, because this ensures the test data will carry through the session to the conversion goal. [Read More Here](http://www.kaushik.net/avinash/hits-sessions-metrics-dimensions-web-analytics/)

### A/B Split Test
	- All A/B tests are run by manipulating HTML/CSS DOM elements in your wordpress theme with javascript.
	- Depending on how many versions you are testing, all site traffic will by split to show each version evenly.
	- When a test version is run, the javascript you defined in the plugin will execute show that variation to the user.
	- No Server-Side scripting is used.
	- Any javascript library can be used in your A/B Test, given that you have loaded the library in your wordpress theme.

### Running An A/B Split Test

After you have installed the plugin, in the wordpress admin, navigate to `AB Testing` and click `Create New Test`. Enter Test Name, each test Version's Name, and enter your custom javascript in `Version Code` and click `Save Test`. When you are ready to start your test, click the checkbox `Active`, which will write your new test to the `js/ab.js` file and make your test live to your site visitors.

Be sure to include your `analytics=true` in all of your test version code snippets.

### Example Test Version Code

First, decide what elements in your theme/HTML you want to test.  Because your `js/ab.js` file is included globably into your theme, your test code will manipulate any DOM element it finds.

Therefore, do not run tests on general elements like `<h1>` or `<button>` unless you want to test these changes sitewide.  It better to be highly specific and target your DOM elements with Ids and Classes.

Also, you must remember to include the `analytics=true` flag in your javascript code.

Here's how we would test the color of `<button class="test_button">Add To Cart</button>` from green to orange.  Let's assume our `button` is already green in our current theme.  Therefore, this is our control version.

However, even though we don't need to change the color for version 1 since it's already green, we must still check to see if `$('button.test_button')` exsists in the DOM, and if so, trigger the `analytics=true` flag to send our Custom Variable data to google analtyics.

Version Code 1
```Javascipt
if ( $('button.test_button').length > 0 ) {
	analytics = true;
}
```
In version 2 we are changing the color to orange. Once again, we must check if `$('button.test_button')` exsists in the DOM.  If it does, we change the button color to orange and trigger the `analytics=true` flag.

Version Code 2
```Javascipt
if ( $('button.test_button').length > 0 ) {
	$('button.test_button').css('background-color', 'orange');
	analytics = true;
}
```

### analytics = true;
	- It is up to you to correctly and logicaly set the `analytics=true` flag in your javascript code.
	- If you forget to set it to true, no test results (custom variables) will show up in analytics.
	- If you set it to true in every test, without checking for test page level DOM elements, you send invalid test data on every page load.

#### Test Results
You will find your test data located in Google Analytics Custom Variables Reporting.
Report Navigation: Audience -> Custom -> Custom Variables

#### Custom Variables Report
You should not have more than 5 tests running at one time.  Or more specifically, no more than 5 tests per visitor session, which is up to you to negotiate.

Depending on how many tests you have running at a given time, your tests will fall into 1 of 5 'slots' in the Custom Variables Report, which are found at;
`Custom Variable (Key 1) Custom Variable (Key 2) Custom Variable (Key 3) Custom Variable (Key 4) Custom Variable (Key 5)`

### License

The WordPress Plugin Split-Testing is licensed under the GPL v2 or later.

> This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License, version 2, as
published by the Free Software Foundation.

> This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

> You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
