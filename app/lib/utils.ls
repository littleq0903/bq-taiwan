lock-signin-btn = !->
   $ "\#btn-signin" .attr 'disabled' true

unlock-signin-btn = !->
   $ "\#btn-signin" .attr 'disabled' false

export !function switch-page page-name
  in-options =
    queue: true,
    duration: 500

  page-class-name = ".#page-name"

  console.log page-class-name

  $ \.page .addClass \hide
  $ page-class-name
    .fade-in in-options
    .remove-class \hide

  if page-name is \page-data
    update-data-view!

