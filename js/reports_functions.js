const covertDate = (startDate, endDate) => {
    const startSeconds = Date.parse(startDate);
    const endSeconds = Date.parse(endDate);
    getAllReports(startSeconds, endSeconds, startDate, endDate);

}

document.addEventListener('DOMContentLoaded', (event) => {
    //the event occurred
    let element = document.getElementById('pdf_list');
    let child = element.childElementCount;
    element.style.display = child ? 'block' : 'none';
});

function getAllReports(start, end, startRange, endRange) {
    let db;
    let dbReq = indexedDB.open('myDatabase', 1);
    dbReq.onsuccess = function(event) {
        db = event.target.result;
        var transaction = db.transaction(["tools"], "readonly");
        transaction.onerror = function(event) {
            console.log("transaction failed", transaction.error);
        };
        var objectStore = transaction.objectStore("tools");
        var objectStoreRequest = objectStore.getAll();
        objectStoreRequest.onsuccess = function(event) {
            var result = objectStoreRequest.result;
            matchDates(result);
        };
    };

    const matchDates = (result) => {
        let data = [];
        let i;
        for (i = 0; i < result.length; i++) {
            let toSeconds = Date.parse(result[i].tool_date);
            if (toSeconds >= start && toSeconds <= end) {
                document.getElementById("message").innerHTML = "Creating PDF..";
                data.push(result[i]);
            }
        }
        makePDF(data, startRange, endRange);
    }
}

const showDetails = (report) => {
    let data_blob = report.getAttribute("data-blob");
    let data_name = report.getAttribute("data-name");
    storeReport(data_blob, data_name);
}

const makePDF = (data, startRange, endRange) => {
        //console.log(data);
        let pdfTitle = new Date();
        let titleToString = pdfTitle.toString();
        let removeTail = titleToString.replace(/GMT.*$/, "")

        function addData(dataName, dataInfo) {
            contentData.push({ text: dataName });

            var bodyData = [];
            dataInfo.forEach(function(answer) {
                bodyData.push([{ text: answer }]);
            });

            contentData.push({ table: { body: bodyData } });
            contentData.push({ text: ' ' });
        }
        var contentData = [];
        contentData.push({ text: "OnTools report from " + removeTail, style: 'header' })
        contentData.push({ text: "Date range: " + startRange + " to " + endRange, style: 'header' })
        contentData.push({ text: "\n" })

        let i;
        let totalSum = [];
        for (i = 0; i < data.length; i++) {
            addData(data[i].tool_name, [data[i].tool_desc, "Price: " + data[i].tool_price, "Date: " + data[i].tool_date]);
            totalSum.push(parseInt(data[i].tool_price));
        }

        var sum = totalSum.reduce(function(a, b) {
            return a + b;
        }, 0);
        contentData.push({ text: "Total amount: $" + sum, style: 'header' })
        contentData.push({ text: "\n" })

        var dd = {
            content: contentData,
            styles: {
                header: {
                    bold: true,
                    fontSize: 15
                }
            },
        };
        //pdfMake.createPdf(dd).download(removeTail); 
        document.getElementById("message").innerHTML = "Report created! Click below to download:";
        const pdfDocGenerator = pdfMake.createPdf(dd);
        pdfDocGenerator.getBlob((blob) => {
            let objectURL = window.URL.createObjectURL(blob);
            //console.log(objectURL);
            let l = document.createElement("li");
            let l_li = document.createElement("a");
            let l_li_text = document.createTextNode(startRange + " to " + endRange);
            let span_ = document.createElement("span");
            span_.setAttribute('class', 'save_span')
            span_.setAttribute('data-blob', objectURL);
            span_.setAttribute('data-name', startRange + " to " + endRange);
            span_.setAttribute('onclick', 'showDetails(this)')
            l_li.appendChild(l_li_text);
            l_li.href = objectURL;
            l_li.setAttribute('download', startRange + " to " + endRange);
            l.setAttribute('class', "pdf_items");
            l.appendChild(l_li);
            l.appendChild(span_);
            document.getElementById("pdf_list").appendChild(l);

        });

    }
    // Create indexedDB/Dexie store for reports
const storeReport = async(data_blob, data_name) => {
    let db_reports = new Dexie('myReports');
    db_reports.version(1).stores({
        reports: '++id, title, file, timestamp'
    });
    db_reports.open().then(function(db) {
        // Database opened successfully
    }).catch(function(err) {
        console.log("Database error: " + err)
    });
    const res = await fetch(data_blob);
    const blob = await res.blob();
    await db_reports.reports.put({
        title: data_name,
        file: blob,
        timestamp: Date.now()
    });
    show_reports();

}

const show_reports = async() => {
    let db_reports = new Dexie('myReports');
    db_reports.version(1).stores({
        reports: '++id, title, file, timestamp'
    });
    db_reports.open().then(function(db) {

    }).catch(function(err) {
        console.log("Database error: " + err)
    });
    const all = await db_reports.reports.toArray();
    if (all.length > 0) {
        document.getElementById("saved_reports").innerHTML = "";
        let i;
        for (i = 0; i < all.length; i++) {
            let objectURL = URL.createObjectURL(all[i].file)
            let objectName = all[i].title;
            let l = document.createElement("li");
            let l_li = document.createElement("a");
            let l_li_text = document.createTextNode(objectName);
            let span_ = document.createElement("i");
            span_.classList.add('bi', 'bi-trash-fill');
            span_.setAttribute('data-blob', objectURL);
            span_.setAttribute('data-name', objectName);
            span_.setAttribute('data-id', all[i].id);
            span_.setAttribute('onclick', 'showDetailsDelete(this)')
            l_li.appendChild(l_li_text);
            l_li.href = objectURL;
            l_li.setAttribute('download', objectName);
            l.classList.add('pdf_items', 'list-group-item');
            l.appendChild(l_li);
            l.appendChild(span_);
            document.getElementById("saved_reports").appendChild(l);
        }


    } else {
        document.getElementById("saved_reports").innerHTML = "<span class='text-muted'>no reports available</span>";
    }
}

const showDetailsDelete = (report) => {
    let data_id = report.getAttribute("data-id");
    deleteReport(data_id);
}

const deleteReport = async(i) => {
    let db_reports = new Dexie('myReports');
    db_reports.version(1).stores({
        reports: '++id, title, file, timestamp'
    });
    db_reports.open().then(function(db) {

    }).catch(function(err) {
        console.log("Database error: " + err)
    });
    let id = parseInt(i);
    await db_reports.reports.where('id').equals(id).delete();
    show_reports();
}