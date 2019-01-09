import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Timer extends Component {
  constructor(props) {
    super(props);
    const { defaultStart, initialTime, endTime } = props;
    this.state = {
      isPaused: !defaultStart,
      time: initialTime,
    };

    // 因为可能有暂停，所以缓存时间方便以后计算相加
    this.tempTime = initialTime;

    // 倒计时
    if (endTime) {
      // 如果以截至时间的日期对象传入，如new Date(2018, 6, 6)
      if (typeof endTime === 'object') {
        this.endTime = new Date(endTime).getTime();
      }
      // 如果传入数字
      // 小于1天的毫秒数则直接使用秒数倒计时
      // 否则返回 Date 对象
      if (typeof endTime === 'number') {
        if (endTime <= 86400) {
          this.endTimeNum = endTime;
        } else {
          this.endTime = new Date(endTime).getTime();
        }
      }
    }
  }

  componentDidMount() {
    if (!this.state.isPaused) {
      this.recordStart = Date.now(); // 记录开始时间
      this.startTimer();
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  toggleTiming = () => {
    const { isPaused } = this.state;
    if (isPaused) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }

  startTimer() {
    if (!this.timer) {
      this.recordStart = Date.now();
      this.setState({
        isPaused: false,
      });
      this.timer = setInterval(this.tick, 1000);
    }
  }
  tick = () => {
    const { endTime, onTick } = this.props;
    // let { time } = this.state;
    const time = this.tempTime + Math.round(this.calculateOffset() / 1000);
    this.setState({ time });
    if (endTime) {
      this.whenToStop(time);
    }
    if (onTick) {
      onTick(time);
    }
  }

  whenToStop(time) {
    if (
      (this.endTimeNum && time >= this.endTimeNum) ||
      (this.endTime && this.remainTime <= 0)
    ) {
      this.remainTime = 0;
      this.stopTimer();
    }
  }

  calculateOffset() {
    const now = Date.now();
    const newOffset = now - this.recordStart;
    // this.recordStart = now;
    return newOffset;
  }
  // 停止计时
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 保存当前计时到tempTime
    this.tempTime = this.state.time;
    this.setState({
      isPaused: true,
    });
  }

  render() {
    const { children } = this.props;
    const { time, isPaused } = this.state;
    const OnlyChildren = React.Children.only(children);
    this.remainTime = time;
    if (this.endTime) {
      this.remainTime = this.endTime - Date.now();
    }
    if (this.endTimeNum) {
      this.remainTime = this.endTimeNum - time;
    }
    return React.cloneElement(OnlyChildren, { time: this.remainTime, isPaused, changeStatus: this.toggleTiming });
  }
}

Timer.propTypes = {
  /** 默认 didMount 的时候即开始计时 */
  defaultStart: PropTypes.bool,
  /** 累计时间的初始值，单位为s */
  initialTime: PropTypes.number,
  /** 倒计时的截止时间，可传入数字或时间对象，如果数字小于1天的秒数，则启用秒倒计时 */
  endTime: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.object, // Date 对象
  ]),
  /** 每秒更新处理的函数 */
  onTick: PropTypes.func,
};

Timer.defaultProps = {
  defaultStart: true,
  initialTime: 0,
};

export default Timer;
