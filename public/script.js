var Comment = React.createClass({
    rawMarkup : function() {
        var raw = marked(this.props.children.toString(), {sanitize: true});
        return {__html: raw};
    },

    render : function() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()}/>
            </div>
        );
    }
});

var CommentList = React.createClass({
    render : function() {
        var commentNodes = this.props.data.map(function(comment) {
            return (
                <Comment author={comment.author}>
                    {comment.text}
                </Comment>
            );
        });

        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    handleSubmit : function(el) {
        el.preventDefault();
        var author = ReactDOM.findDOMNode(this.refs.author).value.trim();
        var text = ReactDOM.findDOMNode(this.refs.text).value.trim();
        if (! author || ! text) {
            // form input is none.
            return;
        }

        //  send comment data for server
        this.props.onCommentSubmit({author: author, text: text});

        ReactDOM.findDOMNode(this.refs.author).value = '';
        ReactDOM.findDOMNode(this.refs.text).value = '';
        return;
    },

    render : function() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say Something" ref="text" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },

    loadCommentsFromServer : function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false, 
            success : function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    handleCommentSubmit : function(comment) {
        var current = this.state.data;
        var updateComment = current.concat([comment]);

        this.setState({data: updateComment});

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success : function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({data: current});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

    componentDidMount : function() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },

    render : function() {
        return (
            <div class="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data}/>
                <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
            </div>
        );
    }
});

ReactDOM.render(
    <CommentBox url="api/comments" pollInterval={2000}/>,
    document.getElementById('content')
)
