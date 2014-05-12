lock-signin-btn = !->
   $ "\#btn-signin" .attr 'disabled' true

unlock-signin-btn = !->
   $ "\#btn-signin" .attr 'disabled' false

export !function switch-page page-name
  in-options = {+queue, duration: 500}

  # hide all pages
  $ ".page" .addClass \hide
  # show specified page
  $ ".#page-name"
    .fade-in in-options
    .remove-class \hide

  update-data-view! if page-name is \page-data

