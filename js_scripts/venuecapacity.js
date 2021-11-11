document.getElementById("check").onclick = function () {
    let allAreFilled = true;
    document
        .getElementById("myForm")
            .querySelectorAll("[required]")
                .forEach(function(i) {
                    if(!allAreFilled) return;
                    if(!i.value) allAreFilled = false;
                    if(i.type === "radio") {
                        let radioValueCheck = false;				          
                        document
                            .getElementById("myForm")
                                .querySelectorAll(`[name=${i.name}]`)
                                    .forEach(function(r) {
                                        if(r.checked) radioValueCheck = true;
                                    })
                            allAreFilled = radioValueCheck;
                    }
                })
                if(!allAreFilled) {
                    alert('Fill all the fields');
                }
};