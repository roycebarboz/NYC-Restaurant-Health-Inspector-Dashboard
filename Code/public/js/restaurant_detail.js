$(function () {
    $('#reviews-box').on('click', '.review-delete', async function () {
        const revId = $(this).data('review-id');

        if (!confirm('Delete this review?')) return;

        try {
            const res = await fetch(`/reviews/${revId}`, {
                method: 'DELETE'
            });
            if (!res.ok) { throw new Error('Failed to delete review'); }
            await res.json();
            location.reload();
        } catch (err) {
            console.error(err);
            alert('Could not delete review');
        }
    });

    $('#FavouriteButton').on('click', async function () {
        const restaurantId = $(this).data('restaurant-id');
        const button = $(this);

        try {
            const res = await fetch(`/favorites/${restaurantId}`, {
                method: 'POST'
            });
            if (!res.ok) { throw new Error('Failed to add to favorites'); }
            const data = await res.json();
            if (data.isFavorite) {
                button.text('Remove from Favorites');
                button.addClass('favorited');
            } else {
                button.text('Add to Favorites');
                button.removeClass('favorited');
            }
        } catch (err) {
            console.error(err);
            alert('Could not update favorites');
        }
    });
});