(function () {

    // extracts the address for the URL it assumes the first field after the ? contains the ID
    function getAddressFromUrl () {
        return JSON.parse(atob(location.search.replace(/^[^=]*=/, '').replace(/&.*/, '')));
    }

    /**
     * Gets the current address of the user. If the user opens the form for the first time, the address is
     * extracted form the url. If the user has already submitted the form, the address is extracted form `localStorage`.
     *
     * Note that the url is used as key in the localStorage. If the url changes slightly, the old data is not retrieved
     * form the localStorage.
     *
     * @returns address
     */
    function getCurrentAddress () {
        var address;
        // we get the data if the user has stored it.
        // We use the current search part of the url (which contains the address we know) as key.
        var rememgeredAddressJSON = localStorage.getItem(location.search);
        if (rememgeredAddressJSON) {
            // console.log('oldAddressJSON=', rememgeredAddressJSON);
            // The user has entered a new addres and we have remembered it!
            // localStorage can only store strings, therefore we have to un JSONify it
            address = JSON.parse(rememgeredAddressJSON);
        } else {
            // this is the address form the url
            address = getAddressFromUrl();
        }
        return address;
    }

    /**
     * Saves the current address in the value attributes of the form.
     * @param address
     */
    function setAddressValues (address) {
        // console.log('setAddressValues=', JSON.stringify(address));
        document.querySelectorAll('input').forEach(function (element) {
            var name = element.name;
            if (address[name] != null) {
                element.setAttribute('value', address[name]);
            }
        });
    }

    /**
     * Loads the initial address into the fields of the form
     */
    function loadAddressIntoFields () {
        setAddressValues(getCurrentAddress());
    }

    /**
     * Gets the fields of the address and saves it in localStorage (so that we can access it the next time the user comes
     * back to our site.
     */
    function saveCurrentAddress () {
        // takes the values form the current fields and saves it in localStorage
        var address = getCurrentAddress();
        document.querySelectorAll('input').forEach(function (element) {
            // we update the element only it it is already in the address
            if (address[element.name] != null) {
                address[element.name] = element.value || '';
            }
        });
        var delta=getDelta(address);
        // We save the state of the address in localStorage so we can get it later
        // We use the `location.search` as key to make sure that we only retrieve the address form localStore if the
        // page is opened with exactly the same URL as before. Else we would not show the new address if we send a
        // new URL to the user.
        // console.log('saveCurrentAddress=', JSON.stringify(address));

        // localStorage can only take strings as value, therefore we have to JSONify the address
        localStorage.setItem(location.search, JSON.stringify(address));

        // we now have to update the form, else it will loose the content.
        setAddressValues(address);
        setValueForElement('#tye-delta',JSON.stringify(delta));
        setValueForElement('#tye-delta-json',JSON.stringify(delta, 2, null));
    }

    function setValueForElement(selector,value){
        var element = document.querySelector(selector);
        if(element){
            element.setAttribute('value', value);
        }

    }

    function getDelta (address) {
        var delta = {};
        var originalAddress = getAddressFromUrl();
        for (var p in originalAddress) {
            if (originalAddress.hasOwnProperty(p)) {
                if (address[p] !== originalAddress[p]) {
                    delta[p] = address[p];
                }
            }
        }
        return delta;
    }

    /**
     * Adds a handler to the form that is executed when the user hits the "Save" button
     */
    function addOnSubmitHandlerToSaveButton () {
        var saveButton = document.querySelector('[method=post]');
        // https://stackoverflow.com/a/7410112/2297345
        if (saveButton.addEventListener) {
            saveButton.addEventListener("submit", saveCurrentAddress, false);  //Modern browsers
        } else if (ele.attachEvent) {
            saveButton.attachEvent('onsubmit', saveCurrentAddress);            //Old IE
        }
        // this is the id of the form
        $("#tye-form").submit(function(e) {
            $("#tye-form-dimmer").addClass('active');

            var url = "https://www.tyeapp.com/wp-json/contact-form-7/v1/contact-forms/706/feedback"; // the script where you handle the form input.

            $.ajax({
                type: "POST",
                url: url,
                data: $("#tye-form").serialize(), // serializes the form's elements.
                success: function(result)
                {
                    $("#tye-form-dimmer").removeClass('active');

                    console.log('result=', JSON.stringify(result, null, 2));
                }
            });

            e.preventDefault(); // avoid to execute the actual submit of the form.
        });
    }

    // theser functions are executed immediately when the script is loaded in the browser:
    loadAddressIntoFields();
    addOnSubmitHandlerToSaveButton();
})();
