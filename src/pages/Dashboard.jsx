
import * as React from 'react';

import { ButtonGroup, Button } from '@progress/kendo-react-buttons';
import { DateRangePicker } from '@progress/kendo-react-dateinputs';
import {
    Sparkline,
    ChartValueAxis,
    ChartValueAxisItem,
    ChartArea
} from '@progress/kendo-react-charts';
import {
    useInternationalization
} from '@progress/kendo-react-intl';
import { firstDayOfMonth, lastDayOfMonth } from '@progress/kendo-date-math';
import { useLocalization } from '@progress/kendo-react-intl';

import { Grid, Column, ColumnMenu } from './../components/Grid';
import { Chart } from './../components/Chart';
import { employees } from './../resources/employees';
import { orders } from './../resources/orders';
import { teams } from './../resources/teams';
import { images } from './../resources/images';
import { filterBy } from '@progress/kendo-data-query';
import { AppContext } from './../AppContext'

const FullNameCell = (props) => {
    const customerPhotoStyle = {
        display: 'inline-block',
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundSize: '32px 35px',
        backgroundPosition: 'center center',
        verticalAlign: 'middle',
        lineHeight: '32px',
        boxShadow: 'inset 0 0 1px #999, inset 0 0 10px rgba(0,0,0,.2)',
        marginLeft: '5px',
        backgroundImage: images[props.dataItem.imgId + props.dataItem.gender]
    };

    const customerName = {
        display: 'inline-block',
        verticalAlign: 'middle',
        lineHeight: '32px',
        paddingLeft: '10px'
    };

    return (
        <td>
            <div style={customerPhotoStyle} />
            <div style={customerName}>{ props.dataItem.fullName }</div>
        </td>
    );
};

const FlagCell = (props) => {
    return (
        <td style={{textAlign: 'center'}}>
            <img
                src={images[props.dataItem.country]}
                style={{width: 30}}
                alt={props.dataItem.country}
            />
        </td>
    );
};

const RatingCell = (props) => {
    const MAX_STARS = 5;
    const rating = props.dataItem.rating;

    return (
        <td>
            {
                [...new Array(MAX_STARS)].map((_, idx) => {
                    const isActive = rating <= idx;
                    return (
                        <span
                            key={idx}
                            className={!isActive ? 'k-icon k-i-star' : 'k-icon k-i-star-outline'}
                            style={!isActive ? {color: '#ffa600'} : undefined}
                        />
                    );
                })
            }
        </td>
    );
};

const OnlineCell = (props) => {
    const badgeStyle = {
        display: 'inline-block',
        padding: '.25em .4em',
        fontSize: '75%',
        fontWeight: 700,
        lineHeight: 1,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        verticalAlign: 'baseline',
        borderRadius: '.25rem'
    };

    const onlineBadgeStyle = {
        ...badgeStyle,
        color: '#fff',
        backgroundColor: '#28a745'
    };

    const offlineBadgeStyle = {
        ...badgeStyle,
        color: '#fff',
        backgroundColor: '#dc3545'
    };
    return (
        <td style={{textAlign: 'center'}}>
            {
                props.dataItem.isOnline === true ?
                    <span style={onlineBadgeStyle}>Online</span> :
                    <span style={offlineBadgeStyle}>Offline</span>
            }
        </td>
    );
};

const EngagementCell = (props) => {
    return (
        <td>
            <Sparkline
                type={'bar'}
                data={props.dataItem.target}
            >
                <ChartArea opacity={0} width={200} />
                <ChartValueAxis visible={false} >
                    <ChartValueAxisItem min={0} max={130} />
                </ChartValueAxis>
            </Sparkline>
        </td>
    );
};

const CurrencyCell = (props) => {
    const redBoldStyle = {
        color: '#d9534f',
        fontWeight: 600
    };

    const intlService = useInternationalization();

    return (
        <td>
             <span style={props.dataItem.budget < 0 ? redBoldStyle : undefined}>{ intlService.formatNumber(props.dataItem.budget, 'c') }</span>
        </td>
    );
};

const Dashboard = () => {
    const [data, setData] = React.useState(employees);
    const [isTrend, setIsTrend] = React.useState(true);
    const [isMyTeam, setIsMyTeam] = React.useState(true);
    const localizationService = useLocalization();

    const { teamId } = React.useContext(AppContext);
    const gridFilterExpression = isMyTeam ? {
            logic: "and",
            filters: [{ field: "teamId", operator: "eq", value: teamId }]
        } : null;

    const [range, setRange] = React.useState({
        start: new Date('2018-07-01T21:00:00.000Z'),
        end: new Date('2018-09-30T21:00:00.000Z')
    });

    const onRangeChange = React.useCallback(
        (event) => {
            let rangeStart;
            let rangeEnd;

            if (event.value.start) {
                rangeStart = firstDayOfMonth(event.value.start)
            }
            if (event.value.end) {
                rangeEnd = lastDayOfMonth(event.value.end)
            }

            setRange({
                start: rangeStart,
                end: rangeEnd
            })
        },
        [setRange]
    );
    const trendOnClick = React.useCallback(
        () => setIsTrend(true),
        [setIsTrend]
    );
    const volumeOnClick = React.useCallback(
        () => setIsTrend(false),
        [setIsTrend]
    );
    const myTeamOnClick = React.useCallback(
        () => setIsMyTeam(true),
        [setIsMyTeam]
    );
    const allTeamOnClick = React.useCallback(
        () => setIsMyTeam(false),
        [setIsMyTeam]
    );

    return (
        <div id="Dashboard" className="dashboard-page main-content">
            <div className="card-container grid">
                <h3 className="card-title">{localizationService.toLanguageString('custom.teamEfficiency')}</h3>
                <div className="card-buttons">
                    <ButtonGroup>
                        <Button togglable={true} selected={isTrend} onClick={trendOnClick}>
                            {localizationService.toLanguageString('custom.trend')}
                        </Button>
                        <Button togglable={true} selected={!isTrend} onClick={volumeOnClick}>
                            {localizationService.toLanguageString('custom.volume')}
                        </Button>
                    </ButtonGroup>
                </div>
                <div className="card-ranges">
                    <DateRangePicker value={range} onChange={onRangeChange} />
                </div>
                <div className="card-component">
                    <Chart
                        data={orders}
                        filterStart={range.start}
                        filterEnd={range.end}
                        groupByField={'teamID'}
                        groupResourceData={teams}
                        groupTextField={'teamName'}
                        groupColorField={'teamColor'}
                        seriesCategoryField={'orderDate'}
                        seriesField={'orderTotal'}
                        seriesType={isTrend ? 'line' : 'column'}
                    />
                </div>
            </div>
            <div className="card-container grid">
                <h3 className="card-title">{localizationService.toLanguageString('custom.teamMembers')}</h3>
                <div className="card-buttons">
                    <ButtonGroup>
                        <Button togglable={true} selected={isMyTeam} onClick={myTeamOnClick}>
                            {localizationService.toLanguageString('custom.myTeam')}
                        </Button>
                        <Button togglable={true} selected={!isMyTeam} onClick={allTeamOnClick}>
                            {localizationService.toLanguageString('custom.allTeams')}
                        </Button>
                    </ButtonGroup>
                </div>
                <span></span>
                <div className="card-component">
                    <Grid data={filterBy(data, gridFilterExpression)} style={{ height: 480, maxWidth: window.innerWidth - 20, margin: '0 auto' }} onDataChange={data => setData(data)}>
                        <Column title={localizationService.toLanguageString('custom.employee')}>
                            <Column field={'fullName'} title={localizationService.toLanguageString('custom.contactName')} columnMenu={ColumnMenu} width={230} cell={FullNameCell} />
                            <Column field={'jobTitle'} title={localizationService.toLanguageString('custom.jobTitle')} columnMenu={ColumnMenu} width={230} />
                            <Column field={'country'} title={localizationService.toLanguageString('custom.country')} columnMenu={ColumnMenu} width={100} cell={FlagCell} />
                            <Column field={'isOnline'} title={localizationService.toLanguageString('custom.status')} columnMenu={ColumnMenu} width={100} cell={OnlineCell} />
                        </Column>
                        <Column title={localizationService.toLanguageString('custom.performance')}>
                            <Column field={'rating'} title={localizationService.toLanguageString('custom.rating')} columnMenu={ColumnMenu} width={110} cell={RatingCell} />
                            <Column field={'target'} title={localizationService.toLanguageString('custom.engagement')} columnMenu={ColumnMenu} width={200} cell={EngagementCell} />
                            <Column field={'budget'} title={localizationService.toLanguageString('custom.budget')} columnMenu={ColumnMenu} width={100} cell={CurrencyCell} />
                        </Column>
                        <Column title={localizationService.toLanguageString('custom.contacts')}>
                            <Column field={'phone'} title={localizationService.toLanguageString('custom.phone')} columnMenu={ColumnMenu} width={130} />
                            <Column field={'address'} title={localizationService.toLanguageString('custom.address')} columnMenu={ColumnMenu} width={200} />
                        </Column>
                    </Grid>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

