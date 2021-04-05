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

    var data = {"OkPercent": 98.86322463768116, "KoPercent": 1.1367753623188406};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4925611413043478, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server2"], "isController": false}, {"data": [0.5058680555555556, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.5011111111111111, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.5035416666666667, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 44160, 502, 1.1367753623188406, 1454.1421874999949, 26, 61041, 217.0, 1381.0, 10312.0, 60315.93000000001, 560.8829842632696, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 160, 0, 0.0, 9258.00625000001, 8729, 9821, 9247.0, 9666.5, 9737.5, 9814.289999999999, 16.291619997963547, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 160, 0, 0.0, 8990.506249999995, 8525, 9490, 9004.5, 9402.3, 9445.8, 9486.95, 16.8527491046977, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server1", 160, 0, 0.0, 60324.950000000004, 60061, 61041, 60289.0, 60561.6, 60599.0, 60793.34, 2.592352559948153, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 160, 0, 0.0, 9160.099999999995, 8640, 9720, 9171.0, 9564.7, 9644.35, 9717.56, 16.44736842105263, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server3", 160, 0, 0.0, 60262.36874999999, 60037, 60582, 60202.5, 60488.0, 60521.8, 60566.75, 2.6235529465779033, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server2", 160, 0, 0.0, 60288.462500000016, 60059, 60636, 60222.5, 60519.5, 60547.8, 60632.95, 2.622391949256716, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 14400, 169, 1.1736111111111112, 713.1765972222237, 26, 21074, 350.5, 569.0, 1411.949999999999, 21028.0, 195.40261079599424, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 14400, 167, 1.1597222222222223, 713.7276388888905, 26, 21074, 350.0, 570.8999999999996, 1405.0, 21024.989999999998, 195.78784211885952, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 14400, 166, 1.1527777777777777, 718.1940972222234, 26, 21073, 349.0, 600.5999999999985, 1412.0, 21026.0, 204.31038152126104, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, 0.199203187250996, 0.0022644927536231885], "isController": false}, {"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 501, 99.800796812749, 1.1345108695652173], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 44160, 502, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 501, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["JoinRoom&Ready_server1", 14400, 169, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 168, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 14400, 167, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 167, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 14400, 166, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 166, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
