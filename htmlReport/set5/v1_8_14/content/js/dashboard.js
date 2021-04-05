/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.94704570791528, "KoPercent": 0.052954292084726864};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4798216276477146, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server2"], "isController": false}, {"data": [0.5011304347826087, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.4989130434782609, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.497, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 35880, 19, 0.052954292084726864, 1959.1426978818306, 26, 61806, 230.0, 1531.0, 5960.0, 61432.0, 552.6206354829269, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 230, 0, 0.0, 10506.073913043483, 10024, 11051, 10511.5, 10918.6, 11007.35, 11045.76, 20.812596145145235, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 230, 0, 0.0, 10139.395652173918, 9695, 10621, 10128.0, 10521.9, 10570.9, 10611.07, 21.63077212451801, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server1", 230, 0, 0.0, 61377.23478260872, 60961, 61806, 61345.5, 61712.6, 61732.25, 61800.52, 3.715970595363115, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 230, 0, 0.0, 10355.76086956522, 9777, 10874, 10292.5, 10777.7, 10824.8, 10867.76, 21.151370240941695, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server3", 230, 0, 0.0, 61134.117391304324, 60626, 61617, 61143.0, 61528.4, 61575.45, 61611.07, 3.7322515212981746, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server2", 230, 0, 0.0, 61192.01739130434, 60686, 61663, 61193.5, 61573.8, 61617.25, 61656.45, 3.728923476005188, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 11500, 7, 0.06086956521739131, 608.8762608695652, 26, 17559, 408.0, 1137.0, 1603.0, 5954.99, 276.81494319275953, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 11500, 5, 0.043478260869565216, 602.6899130434796, 26, 17593, 408.5, 1151.0, 1606.0, 5952.99, 301.7659870371828, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 11500, 7, 0.06086956521739131, 606.8670434782618, 26, 17560, 403.0, 1150.8999999999996, 1604.0, 5944.99, 301.9323671497585, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, 5.2631578947368425, 0.002787068004459309], "isController": false}, {"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 18, 94.73684210526316, 0.05016722408026756], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 35880, 19, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 18, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["JoinRoom&Ready_server1", 11500, 7, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 6, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 11500, 5, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 11500, 7, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 7, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
