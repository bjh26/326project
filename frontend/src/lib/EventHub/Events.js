/**
 * An object containing various message types for post management.
 * Change this for your applications 
 */
export const Events = {
    NewPost: "NewPost",
  
    LoadPosts: "LoadPosts",
    LoadPostsSuccess: "LoadPostsSuccess",
    LoadPostsFailure: "LoadPostsFailure",

    LoadPost: "LoadPost",
    LoadPostSuccess: "LoadPostSuccess",
    LoadPostFailure: "LoadPostFailure",

    SearchPosts: "SearchPosts",
    SearchPostsSuccess: "SearchPostsSuccess",
    SearchPostsFailure: "SearchPostsFailure",

    PostSelected: "PostSelected",
    PostSelectedSuccess: "PostSelectedSuccess",
    PostSelectedFailure: "PostSelectedFailure",
  
    StorePost: "StorePost",
    StorePostSuccess: "StorePostSuccess",
    StorePostFailure: "StorePostFailure",
  
    UnStorePosts: "UnStorePosts",
    UnStorePostsSuccess: "UnStorePostsSuccess",
    UnStorePostsFailure: "UnStorePostsFailure",

    
    ClearPosts: "ClearPosts",
    PostsCleared: "PostsCleared",
    PostError: "PostError",

    ProgressSave: "ProgressSave",
    ProgressSaveSuccess: "ProgressSaveSuccess",
    ProgressSaveFailure: "ProgressSaveFailure",
    
    // Pages switching events
    NavigateTo: "NavigateTo",
    NavigatePostPage: "NavigatePostPage",
  };