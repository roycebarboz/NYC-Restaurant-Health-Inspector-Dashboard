$(function () {
    
    $('#add_button').on('click', function () {
        const filter = $('#filter').val();
        const value = $('#filter_text').val().trim();
        $("#filter-error").text("").hide();

        if (!filter || !value) return;

        if ($(`input[name="filters[${filter}]"]`).length) return;

        if (filter == 'grade'){
            if (!/^[ABCDEF]$/i.test(value)){
                $("#filter-error").text("Grade must be A-F").show();
                return}};

        if ((filter === 'minScore' || filter === 'maxScore') && (isNaN(value)|| value > 10 || value < 0)) {
            $("#filter-error").text("Score must be a valid number").show();
            return;}
        
        if (filter === 'cuisineType' || value.trim().length==0){
            $("#filter-error").text("Cuisine must be a valid word").show();
            return;}

        const chip = $(`
            <div class="filter-chip">
                ${filter}: ${value}
                <span class="remove">✕</span>
            </div>
        `);

        const hidden = $(`<input>`, {
            type: 'hidden',
            name: `filters[${filter}]`,
            value
        });

        chip.find('.remove').on('click', function () {
            hidden.remove();
            chip.remove();
        });

        $('#addedFilters').append(chip);
        $('#search-bar').append(hidden);

        $('#filter').val('');
        $('#filter_text').val('');
        });

    fetch('/restaurants/featured')
    .then(res => {
        if (!res.ok) throw new Error('Failed to load featured');
        return res.json();
    })
    .then(restaurants => {
        const container = $('#landing_page_images');
        container.empty();
        
        if (!restaurants||restaurants.length===0){
            const card = $('<div>').attr("id","landing_page_card")

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