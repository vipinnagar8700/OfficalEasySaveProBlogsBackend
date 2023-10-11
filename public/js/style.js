const checkBox = document.getElementById("checkbox");

const onClickCheckBox = () => {
    const checkBoxIco = document.getElementById("checkbox-ico").style;
    if (checkBoxIco.display === "none" || !checkBoxIco.display) {
        checkBoxIco.display = "inline-block";
    } else {
        checkBoxIco.display = "none";
    }
};

checkBox.addEventListener("click", onClickCheckBox);
