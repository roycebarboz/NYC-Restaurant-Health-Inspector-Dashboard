$(function(){
    $('#reviewForm').on('submit', function(event){
    event.preventDefault();
    $('.error').text("").hide();
    
    const Title = $('#Review-Title').val().trim();
    const Body = $('#Review-Body').val().trim();
    const visitDate = $('#Review-visitDate').val();

    let formcheck = true;

    if(Title.trim().length==0 || !/^[a-zA-Z0-9 ,.()!?'"]{3,100}$/.test(Title)){
        $("#Review-Title-error").text("Title must be 3-100 characters with valid characters. Numbers, Letters, space and punctuation is allow.").show();
            formcheck=false;}
    if(Body.trim().length===0 || !/^[a-zA-Z0-9 ,.()!?'"]{3,256}$/.test(Body)){
        $("#Review-Body-error").text("Review must be 3-100 characters with valid characters. Numbers, Letters, space and punctuation is allow.").show();
            formcheck=false;}
    if(visitDate){
        const visitDateprocessed = new Date(visitDate);
        const now = new Date();
        const backinmydays = new Date;
        backinmydays.setFullYear(now.getFullYear()-30);

        if(visitDateprocessed>now||visitDateprocessed<backinmydays){
            $("#Review-visitDate-error").text("Date cannot be in the future or 30 years ago").show();
        formcheck=false;}
        }
    if(formcheck){this.submit();}
    });
});