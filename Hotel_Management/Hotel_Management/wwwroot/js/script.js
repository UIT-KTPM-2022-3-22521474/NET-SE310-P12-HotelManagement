﻿/*================================= Hàm xử lí cho customer ===================================*/
$(document).ready(function () {
    // Hàm thêm khách hàng
    $('#addCustomerForm').on('submit', function (event) {
        event.preventDefault();

        // Validate input trước khi gửi
        const nationalId = $('input[name="national_id"]').val();

        // Kiểm tra độ dài CCCD (ví dụ: 9 hoặc 12 chữ số)
        if (!/^\d{12}$/.test(nationalId)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Invalid ID number. It must be 12 digits.'
            });
            return;
        }

        // Thu thập dữ liệu từ form
        const customerData = {
            FullName: $('input[name="customer_name"]').val(),
            PhoneNumber: $('input[name="phone_number"]').val(),
            Email: $('input[name="email"]').val(),
            CCCD: nationalId
        };

        // Gửi dữ liệu qua API
        $.ajax({
            url: '/Customer/CreateCustomer', // URL API
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(customerData),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Customer added successfully!'
                }).then(() => {
                    location.reload(); // Tải lại trang
                });
            },
            error: function (xhr) {
                // Xử lý các loại lỗi khác nhau
                if (xhr.status === 409) {
                    // Lỗi trùng CCCD
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'A customer with this ID number already exists.'
                    });
                } else {
                    // Các lỗi khác
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: xhr.responseJSON?.message || 'An error occurred while adding the customer.'
                    });
                }
            }
        });
    });

    // Kiểm tra validate input CCCD khi nhập
    $('input[name="national_id"]').on('input', function () {
        const value = $(this).val();
        const errorSpan = $('#national-id-error');

        if (!/^\d+$/.test(value)) {
            $(this).val(value.replace(/[^\d]/g, '')); // Chỉ cho phép số
        }

        if (value.length > 0 && !/^\d{12}$/.test(value)) {
            errorSpan.text('Invalid ID number. It must be 12 digits.');
            $(this).addClass('is-invalid');
        } else {
            errorSpan.text('');
            $(this).removeClass('is-invalid');
        }
    });

    // Xử lý sự kiện khi nhấn nút Edit
    $('.edit-room').on('click', function () {
        var row = $(this).closest('tr');

        // Điền thông tin vào modal
        $('#editCustomerModal input[name="customer_id"]').val(row.find('td:first').text());
        $('#editCustomerModal input[name="customer_name"]').val(row.find('td:nth-child(2)').text());
        $('#editCustomerModal input[name="phone_number"]').val(row.find('td:nth-child(3)').text());
        $('#editCustomerModal input[name="email"]').val(row.find('td:nth-child(4)').text());
        $('#editCustomerModal input[name="national_id"]').val(row.find('td:nth-child(5)').text());
    });

    // Xử lý form submit để cập nhật khách hàng
    $('#editRoomForm').on('submit', function (e) {
        e.preventDefault();

        var customerId = $('#editCustomerModal input[name="customer_id"]').val();
        var customerData = {
            CustomerID: parseInt(customerId),
            FullName: $('#editCustomerModal input[name="customer_name"]').val(),
            PhoneNumber: $('#editCustomerModal input[name="phone_number"]').val(),
            Email: $('#editCustomerModal input[name="email"]').val(),
            CCCD: $('#editCustomerModal input[name="national_id"]').val()
        };

        $.ajax({
            url: '/Customer/UpdateCustomer/' + customerId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(customerData),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Customer information updated successfully.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    location.reload(); // Làm mới trang
                });
            },
            error: function (xhr) {
                if (xhr.status === 409) { // Trùng CCCD
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'A customer with this ID number already exists.',
                        confirmButtonText: 'Close'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: xhr.responseJSON.message || 'An error occurred while updating the customer information.',
                        confirmButtonText: 'Close'
                    });
                }
            }
        });
    });

});
// Hàm xác nhận và xóa khách hàng
function confirmCustomerDelete(customerId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to undo this action!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/Customer/DeleteCustomer/' + customerId,
                type: 'DELETE',
                success: function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted',
                        text: response.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        location.reload(); // Làm mới trang
                    });
                },
                error: function (xhr) {
                    if (xhr.status === 409) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'The customer cannot be deleted because the customer has already booked.'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'An error occurred while deleting the customer.',
                            confirmButtonText: 'Close'
                        });
                    }
                }
            });
        }
    });
}

/*================================= Hàm xử lí cho Booking ===================================*/
$('#addBookingForm').on('submit', function (event) {
    event.preventDefault();

    const checkInDate = $('input[name="CheckInDate"]').val();
    const checkOutDate = $('input[name="CheckOutDate"]').val();

    // Basic validation
    if (!checkInDate || !checkOutDate) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Dates',
            text: 'Please select both check-in and check-out dates'
        });
        return;
    }

    const bookingData = {
        customerID: parseInt($('select[name="CustomerID"]').val()),
        roomID: parseInt($('select[name="RoomID"]').val()),
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        status: "Pending"
    };

    // Validate required fields
    if (!bookingData.customerID || !bookingData.roomID) {
        Swal.fire({
            icon: 'error',
            title: 'Missing Data',
            text: 'Please select both customer and room'
        });
        return;
    }

    console.log('Sending booking data:', bookingData); // Debug log

    $.ajax({
        url: '/Booking/CreateBooking',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(bookingData),
        success: function (response) {
            console.log('Success response:', response); // Debug log
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Booking added successfully!'
            }).then(() => {
                location.reload();
            });
        },
        error: function (xhr, status, error) {
            console.error('Error response:', xhr.responseJSON); // Debug log
            let errorMessage = 'An error occurred while adding the booking.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
                if (xhr.responseJSON.details) {
                    errorMessage += '\n' + xhr.responseJSON.details;
                }
            }
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
});

// Thêm vào phần Booking trong file script.js
function confirmBookingDelete(bookingId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this booking? This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteBooking(bookingId);
        }
    });
}

function deleteBooking(bookingId) {
    const row = $(`tr[data-booking-id="${bookingId}"]`);
    row.addClass('deleting');

    $.ajax({
        url: '/Booking/DeleteBooking/' + bookingId,
        type: 'DELETE',
        beforeSend: function () {
            row.find('.dropdown-action').addClass('disabled');
        },
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Booking has been deleted successfully.',
                showConfirmButton: true,  // Hiển thị nút OK
                confirmButtonText: 'OK',  // Text cho nút OK
                timer: null  // Bỏ timer để alert không tự đóng
            }).then((result) => {
                if (result.isConfirmed) {  // Khi người dùng click OK
                    location.reload();  // Load lại danh sách booking
                }
            });
        },
        error: function (xhr) {
            row.removeClass('deleting');
            row.find('.dropdown-action').removeClass('disabled');

            let errorMessage = 'An error occurred while deleting the booking.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        }
    });
}

function loadBookings() {
    $.ajax({
        url: '/Booking/GetBookings', // Đảm bảo API này trả về danh sách booking
        type: 'GET',
        success: function (data) {
            const tbody = $('.datatable tbody');
            tbody.empty();
            data.forEach(booking => {
                tbody.append(`
                    <tr data-booking-id="${booking.BookingID}">
                        <td>${booking.BookingID}</td>
                        <td>${booking.Customer.FullName}</td>
                        <td>${booking.Room.RoomNumber}</td>
                        <td>${new Date(booking.CheckInDate).toLocaleDateString()}</td>
                        <td>${new Date(booking.CheckOutDate).toLocaleDateString()}</td>
                        <td>${booking.Status}</td>
                        <td class="text-right">
                            <div class="dropdown dropdown-action">
                                <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-ellipsis-v ellipse_color"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" href="javascript:void(0);" onclick="confirmBookingDelete(${booking.BookingID})">
                                        <i class="fas fa-trash-alt m-r-5"></i> Delete
                                    </a>
                                </div>
                            </div>
                        </td>
                    </tr>
                `);
            });
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'An error occurred while loading bookings.',
                confirmButtonText: 'OK'
            });
        }
    });
}

