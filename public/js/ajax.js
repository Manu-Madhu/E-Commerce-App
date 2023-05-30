function toggleBlock(userId) {
    // Send AJAX request to the server
    $.ajax({
        url: '/admin/toggleBlock',
        type: 'POST',
        data: { userId: userId },
        success: function (response) {
            // Update the button text and style based on the response
            var button = $('button[data-user-id="' + userId + '"]');
            if (response.isBlocked) {
                button.text('Unblock');
            } else {
                button.text('Block');
            }
        },
        error: function (error) {
            console.log(error);
        }
    });
}