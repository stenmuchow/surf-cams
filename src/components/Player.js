import React, { Component } from 'react';
import Hls from 'hls.js';

import PropTypes from 'prop-types';

import Option from 'muicss/lib/react/option';
import Select from 'muicss/lib/react/select';
import Button from 'muicss/lib/react/button';

import ReactGA from 'react-ga';

export default class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hls: false,
            showError: false,
        };
    }

    setupPlayer(url) {
        this.setState({ showError: false }, () => {
            if (this.state.hls) {
                this.state.hls.destroy();
                this.setState({ hls: false });
            }
            if (Hls.isSupported()) {
                let beachHls = new Hls();
                beachHls.loadSource(url);
                beachHls.attachMedia(this.refs.video);
                beachHls.on(Hls.Events.MANIFEST_PARSED, () => {
                    this.refs && this.refs.video && this.refs.video.play();
                });
                beachHls.on(Hls.Events.ERROR, (event, err) => {
                    console.log(err);
                    if (err.response && err.response.code === 404) {
                        this.setState({ showError: true });
                        beachHls.destroy();
                    }
                });
                this.setState({ hls: beachHls });
            } else {
                this.refs.video.src = url;
                this.refs.video.play();
            }
        });
    }

    delete() {
        this.state.hls && this.state.hls.detroy && this.state.hls.destroy();
        this.setState({ hls: false }, () => this.props.deleteCamera({ index: this.props.index }));
    }

    componentDidMount() {
        this.setupPlayer(this.props.url);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.url !== this.props.url) {
            this.setupPlayer(nextProps.url);
        }
    }

    changeCamera = (index, url) => {
        if (url === 'suggest_new_camera') {
            const a = document.createElement('a');
            a.href = 'mailto:powdertothepeeps@gmail.com?subject=New Camera Suggestion';
            a.target = '_blank';
            a.click();
            return this.props.onClick({
                index,
                url: 'https://cams.cdn-surfline.com/cdn-int/pt-arrifana/playlist.m3u8',
            });
        }
        ReactGA.event({ category: 'Camera Player', action: 'Change Camera', label: url });
        this.props.onClick({ index, url });
    };

    render() {
        const footer = (
            <div className="player__footer__uncollapsed">
                <Select
                    value={this.props.url}
                    onChange={event => this.changeCamera(this.props.index, event.target.value)}
                >
                    {this.props.beachNames.map((beach, key) => (
                        <Option key={key} value={beach.url} label={beach.name} />
                    ))}
                    <Option key="suggest_new_camera" value="suggest_new_camera" label="* Suggest New Camera *" />
                </Select>
            </div>
        );

        const playerContent = this.state.showError ? (
            <main className="player__error">
                <div>Camera offline.</div>
            </main>
        ) : (
            <main className="player__content">
                <Button className="player__delete" variant="fab" color="danger" onClick={() => this.delete()}>
                    &times;
                </Button>
                <video ref="video" autoPlay controls />
            </main>
        );

        return (
            <article className="player">
                {playerContent}

                <footer className="player__footer">{footer}</footer>
            </article>
        );
    }
}

Player.propTypes = {
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};
