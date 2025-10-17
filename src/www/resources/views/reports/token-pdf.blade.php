<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Loan Inquiry Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            margin: 20px
        }

        .header {
            width: 100%;
        }

        .header-table {
            width: 100%;
        }

        .header-table td {
            vertical-align: top;
        }

        .header .left {
            width: 33%;
            text-align: left;
        }

        .header .center {
            width: 34%;
            text-align: center;
        }

        .header .right {
            width: 33%;
            text-align: right;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        h2 {
            margin: 0;
        }

        @page {
            margin: 20px 10px;
        }

        .footer {
            position: fixed;
            bottom: 5px;
            left: 0;
            right: 0;
        }

        .pagenum:before {
            content: counter(page);
        }
    </style>
</head>

<body>

    {{-- Header --}}
    <div class="header">
        <table class="header-table">
            <tr style="background-color: #615fff;color:#fff;">
                <td class="left" style="border: none">
                    Summary Report
                </td>
                <td class="center" style="border: none">
                    <span style="font-size:16px;font-weight:bold;">{{$name}}</span>
                </td>
                <td class="right" style="border:none;">
                    {{ $dates }}
                </td>
            </tr>
        </table>
    </div>

    <table style="margin-top: 20px;">
        <tbody>
            <tr style="background-color: #615fff;color:#fff;">
                <td style="text-align: center">Total Visits Today</td>
                @foreach ($stats as $key => $stat)
                    <td style="text-align: center">{{ $stat['service_name'] }}</td>
                @endforeach
            </tr>
            <tr>
                <td style="text-align: center">{{ $total_visits }}</td>
                @foreach ($stats as $key => $stat)
                    <td style="text-align: center">{{ $stat['service_count'] }} <br> {{ $stat['avgTime'] }}</td>
                @endforeach
            </tr>
        </tbody>
    </table>

    {{-- Report Table --}}
    <table style="margin-top: 20px;">
        <thead>
            <tr>
                <th colspan="9" style="background-color: #615fff;color:#fff;">{{$selectedServiceName}}</th>
            </tr>
            <tr>
                <th>#</th>
                <th>Service</th>
                <th>Counter</th>
                <th>User</th>
                <th>No Show</th>
                <th>Served</th>
                <th>Total</th>
                <th>Avg Time</th>
                <th>Feedback</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($records as $index => $token)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $token->service->name ?? '-' }}</td>
                    <td>{{ $token->name ?? '-' }}</td>
                    <td>{{ $token->user->name ?? '-' }}</td>
                    <td>{{ $token->not_show_count ?? 0 }}</td>
                    <td>{{ $token->served_count ?? 0 }}</td>
                    <td>{{ $token->no_show_count_plus_served_count ?? 0 }}</td>
                    <td>{{ $token->avgTime ?? '00:00:00' }}</td>
                    <td>{{ $token->feedback ?? 'No Rating' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Footer --}}
    <div class="footer">
        <table style="width: 100%; margin-top: 40px; font-size: 10px;">
            <tr>
                <td style="text-align: left;width:33%;border:none;">
                    Generated on: {{ now()->format('M d, Y H:i A') }}
                </td>
                <td style="text-align: center;width:34%;border:none;">
                    Powered by <span style="color:#615fff;">{{ config('app.name') }}</span>
                </td>
                <td style="text-align: right;width:33%;border:none;">
                    Page <span class="pagenum"></span>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
