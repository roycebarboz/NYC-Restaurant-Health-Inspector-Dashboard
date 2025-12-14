$(function(){
    const searchfilterbox = $("#search-filters");
    const filters = new URLSearchParams(window.location.search);
    
    for (let f of filters){
        let p = $('<p>').text(`${f}`);
    }
});