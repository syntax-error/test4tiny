/*global $*/
$(function () {
    "use strict";
    const bodyEl = $("body");
    const comicContainerEl = $("#comic-container");
    const reloadBtnEl = $("#reload-btn");
    const modalEl = $("#modal");
    const loadingEl = $(`<div class="loading">Loading...</div>`);
    const comicsToFetch = 9;
    /*
     * Creates a jQuery element holding an XKCD comic image, title and number
     * @param {string} config.title - The title of the XKCD comic
     * @param {string} config.num - The number of the XKCD comic
     */
    function createComicPanelEl(config) {
        return $(`
            <div class="comic" style="background-image: url('./comic/image/${config.num}')">
                <div class="title-bar">
                    <span class="num">${config.num}</span>: <span class="title">${config.title}</span>
                </div>
            </div>
        `);
    }
    /*
     * Loads {comicsToFetch} number of panels into {comicContainerEl}
     * each panel opens a modal view on click
     */
    function reload() {
        comicContainerEl.empty();
        comicContainerEl.append(loadingEl);
        $.getJSON(`./comic/random/${comicsToFetch}`, function onSucceed(json) {
            loadingEl.detach();
            const comics = json.comics;
            comics.forEach(function insertIntoContainer(comicDetails) {
                let comicEl = createComicPanelEl(comicDetails);
                comicContainerEl.append(comicEl);
                comicEl.on("click", function () {
                    modalEl.html(`<img src="./comic/image/${comicDetails.num}" title="${comicDetails.alt}"/>`);
                    modalEl.show();
                    bodyEl.addClass("modal-open");
                });
            });
        });
    }
    reloadBtnEl.on("click", reload);
    modalEl.on("click", function closeModal(event) {
        if (event.target === modalEl[0]) {
            modalEl.hide();
            bodyEl.removeClass("modal-open");
        }
    });
    // Trigger reload on page load
    reload();
});