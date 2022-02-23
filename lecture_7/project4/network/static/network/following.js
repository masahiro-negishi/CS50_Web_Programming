// Start with first post
let posts_num = 0;

// Load posts 10 at a time
const quantity = 10;

// When DOM Loads, render the first 10 posts
document.addEventListener('DOMContentLoaded', () => {load('next')});

// "Previous" button is not shown at first
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#previous').style.display = 'none';
});

// If "Previous" button is pushed, show the previous 10 posts
// If "Next" button is pushed, show the next 10 posts
document.addEventListener('click', event => {
    const element = event.target;
    if (element.id === 'previous') {
        load('previous');
    }
    else if(element.id === 'next') {
        load('next');
    }
    else if(element.className === 'like_icon_off') {
        like(element.parentElement.parentElement, 'like');
        element.style.animationPlayState = 'running';
        element.addEventListener('animationend', () => {
            element.className = '';
            element.className = 'like_icon_on';
        })
    }
    else if(element.className === 'like_icon_on') {
        like(element.parentElement.parentElement, 'unlike');
        element.className = '';
        element.className = 'like_icon_off';
        element.style.animationPlayState = 'paused';
    }
})

// Load 10 posts
function load(type) {
    // Decide start post
    let start = 0;
    if (type === 'next') {
        start = posts_num;
    }
    else {
        if (posts_num % quantity === 0) {
            start = posts_num - 2 * quantity;
        }
        else {
            start = Math.floor((posts_num/quantity))*quantity - quantity;
        }
    }

    // Get posts from DB through API
    fetch(`get_posts_follows/${start}`)
    .then(response => {
        if (!response.ok) {
            throw new Error();
        }
        return response.json();
    })
    .then(posts => {
        // Clean up posts shown at present
        document.querySelector('.follows_posts').innerHTML = '';

        // Show posts
        for (let i = 0; i < posts.length; i++){
            const one_post = document.createElement('div');
            one_post.className = 'border rounded';

            // Make html element for poster, content, time, and likes
            const poster = document.createElement('a');
            const content = document.createElement('div');
            const time = document.createElement('div');
            const like = document.createElement('div');
            const like_icon = document.createElement('div');
            const like_num = document.createElement('div');
            poster.className = 'poster';
            time.className = 'timestamp';
            like.className = 'like';
            if (posts[i].visitor_like) {
                like_icon.className = 'like_icon_on';
            }
            else {
                like_icon.className = 'like_icon_off';
            }
            like_num.className = 'like_num';
            poster.href = `profile/${posts[i].user}`;
            poster.innerHTML = posts[i].user;
            content.innerHTML = posts[i].body;
            time.innerHTML = posts[i].timestamp;
            like_num.innerHTML = posts[i].likes_num;
            like_icon.innerHTML = '';
            like.appendChild(like_icon);
            like.appendChild(like_num);

            // Add them to one_post
            one_post.appendChild(poster);
            one_post.appendChild(content);
            one_post.appendChild(time);
            one_post.appendChild(like);

            // Save id
            const id = document.createElement('div');
            id.innerHTML = posts[i].id;
            id.className = 'id';
            id.style.display = 'none';
            one_post.appendChild(id);

            // Add one_post to the index page
            document.querySelector('.follows_posts').appendChild(one_post);
        }

        // Update posts_num
        posts_num = start + posts.length;

        // Show "Previous" button if there are newer posts
        if (posts_num > quantity) {
            document.querySelector('#previous').style.display = 'block';
        }
        else {
            document.querySelector('#previous').style.display = 'none';
        }
    })
    .catch(error => {
        console.log('Error: ', error);
        alert('There is not older post any more')
    })
}

// Get Cookie
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Like or Unlike
function like(post, type) {
    id = post.querySelector('.id').innerHTML;
    next_like = false;
    if (type == 'like') {
        next_like = true;
    }
    data = JSON.stringify({
        id: id,
        like: next_like
    })
    let csrftoken = getCookie('csrftoken');
    // Apply changes to DB
    fetch('../like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        post.querySelector('.like_num').innerHTML = data.likes_num;
    })
    .catch(error => {
        console.log('Error: ', error);
    })
}