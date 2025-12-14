$(function(){
    $('#reviews-box').on('click','.review-delete', function(){
        const revId = $(this).data('review-id');

        if(!confirm('Delete this review?'))return;

        fetch(`/reviews/${revId}`,{
            method: 'DELETE'
        })
        .then(res => {
            if(!res.ok){throw new Error('Failed to delete review');}
            return res.json()
        })
        .then(()=>{
            location.reload();
        })
        .catch(err =>{
            console.error(err);
            alert('Could not delete review');
        });
    });
});