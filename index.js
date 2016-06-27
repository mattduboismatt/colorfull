let React    = require('react');
let ReactDOM = require('react-dom');
let Relay    = require('react-relay');

class Link extends React.Component {
  render() {
    let link = this.props.store;

    return (
      <div>
        <h3><a href={link.url}>{link.title}</a></h3>
        <p>score: {link.score} - comments: {link.numComments} - author: {link.author.username}</p>
        <hr/>
      </div>
    );
  }
};

class Subreddit extends React.Component {
  render() {
    let topListings = this.props.store.topListings.map(
      (store, idx) => <Link store={store} key={idx} />
    );
    return <div>
      <h1>Links</h1>
      { topListings }
    </div>;
  }
};

Link = Relay.createContainer(Link, {
  fragments: {
    store: () => Relay.QL`
      fragment on RedditLink {
        url,
        title,
        score,
        numComments,
        author {
          username
        }
      }
    `,
  },
});


Subreddit = Relay.createContainer(Subreddit, {
  fragments: {
    store: () => Relay.QL`
      fragment on RedditAPI {
        subreddit(name: "dogs") {
          topListings(limit: 20) { ${Link.getFragment('store')} },
        }
      }
    `,
  },
});


class RedditRoute extends Relay.Route {
  static routeName = 'RedditRoute';
  static queries = {
    store: ((Component) => {
      // Component is our Subreddit
      return Relay.QL`
      query root {
        reddit {
          subreddit(name: "dogs") { ${Component.getFragment('store')} },
        }
      }
    `}),
  };
};

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer('http://www.GraphQLHub.com/graphql')
);

let mountNode = document.getElementById('container');
let rootComponent = <Relay.RootContainer Component={Subreddit} route={new RedditRoute()} />;
ReactDOM.render(rootComponent, mountNode);
