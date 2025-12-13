$(function () {
    fetch('/restaurants/featured')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load featured');
        return res.json();
    })
    .then(restaurants => {
        const container = $('#landing_page_images');
        container.empty();
        
        if (!restaurants||restaurants.length===0){
            const card = $('<div>').addId("landing_page_card")

            const img = $('<img>')
                .attr('src', '/public/images/no_image_1.png')
                .attr('alt', 'No Featured Restaurants');
            const name = $('<h2>').text("No featured restaurants available yet");

            card.append(img, name);
            container.append(card);
            return
        }
    

        restaurants.forEach(res =>{
        const card = $('<div>').attr("id","landing_page_card")

        const img = $('<img>')
            .attr('src', res.image || '/public/images/no_image_1.png')
            .attr('alt', res.name);
        const name = $('<h2>').text(res.name);

        card.append(img, name);
        container.append(card);
        });
    })
    .catch(err => {
        console.error(err);
        $('#landing_page_images').text('Failed to load featured restaurants.');
    });     
});