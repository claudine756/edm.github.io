import pandas as pd
import plotly.graph_objects as go
from plotly.offline import plot
import json

# --- Dummy Data Generation (mimicking your dashboard's data) ---
# Sales by Year-Month and Country
months = pd.date_range(start='2014-01', periods=12, freq='M').strftime('%Y-%m').tolist()
sales_data_line = {
    'Montana': [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
    'Carr': [25, 28, 32, 38, 42, 48, 52, 58, 62, 68, 72, 78],
    'Amant': [20, 22, 25, 28, 30, 33, 36, 39, 42, 45, 48, 50],
    'VTT': [15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42]
}

# Sales by Product (Donut Chart)
sales_product_data = pd.DataFrame({
    'product': ['Carr', 'Montana', 'VTT', 'Pison', 'Others'],
    'value': [18.3, 15.3, 18.25, 23.01, 25.14]
})

# Sales by Country (Donut Chart)
sales_country_data_donut = pd.DataFrame({
    'country': ['Mexico', 'Germany', 'Canada', 'United States'],
    'value': [20.89, 23.51, 24.95, 30.65]
})

# Sales by Country (Bar Chart)
sales_country_data_bar = pd.DataFrame({
    'country': ['United States of America', 'Canada', 'France', 'Germany', 'Mexico'],
    'sales': [28.00, 24.33, 24.01, 23.86, 25.98]
})

# --- Color Palette ---
colors = [
    '#0078D4', '#40E0D0', '#87CEEB', '#B0E0E6', '#4682B4', '#6495ED', '#ADD8E6', '#DDA0DD', '#FFDAB9', '#FFB6C1'
]

def generate_line_chart_data():
    """Generates data for Sales by Year-Month and Country Line Chart."""
    traces = []
    i = 0
    for country, sales in sales_data_line.items():
        traces.append(go.Scatter(
            x=months,
            y=sales,
            mode='lines',
            name=country,
            line=dict(color=colors[i % len(colors)], width=2)
        ))
        i += 1
    return traces

def generate_donut_product_chart_data():
    """Generates data for Sales by Product Donut Chart."""
    trace = go.Pie(
        labels=sales_product_data['product'],
        values=sales_product_data['value'],
        hole=0.6,
        marker=dict(colors=colors[:len(sales_product_data)]),
        textinfo='percent',
        hoverinfo='label+percent+value',
        textfont=dict(size=14, color='#FFFFFF')
    )
    return [trace]

def generate_donut_country_chart_data():
    """Generates data for Sales by Country Donut Chart."""
    trace = go.Pie(
        labels=sales_country_data_donut['country'],
        values=sales_country_data_donut['value'],
        hole=0.6,
        marker=dict(colors=colors[:len(sales_country_data_donut)][::-1]), # Reversed colors
        textinfo='percent',
        hoverinfo='label+percent+value',
        textfont=dict(size=14, color='#FFFFFF')
    )
    return [trace]

def generate_bar_country_chart_data():
    """Generates data for Sales by Country Bar Chart."""
    trace = go.Bar(
        x=sales_country_data_bar['sales'],
        y=sales_country_data_bar['country'],
        orientation='h',
        marker=dict(color=colors[0])
    )
    return [trace]

if __name__ == '__main__':
    # You can choose to print JSON data or save as HTML.
    # For integration with your JS, you'd typically serve this JSON.

    # Example: Print JSON for line chart
    # print("Line Chart Data (JSON):")
    # print(json.dumps([t.to_plotly_json() for t in generate_line_chart_data()]))

    # Example: Generate HTML files for demonstration
    fig1 = go.Figure(data=generate_line_chart_data(), layout={
        'xaxis': {'title': 'Year-Month', 'showgrid': False},
        'yaxis': {'title': 'Sales (M)', 'gridcolor': '#e0e0e0'},
        'plot_bgcolor': 'rgba(0,0,0,0)',
        'paper_bgcolor': 'rgba(0,0,0,0)',
        'font': {'family': 'Segoe UI', 'size': 12, 'color': '#333'},
        'margin': {'l': 50, 'r': 20, 't': 30, 'b': 50},
        'hovermode': 'closest',
        'legend': {'orientation': 'h', 'yanchor': 'bottom', 'y': 1.02, 'xanchor': 'right', 'x': 1}
    })
    plot(fig1, filename='sales_by_year_month_country.html', auto_open=False)

    fig2 = go.Figure(data=generate_donut_product_chart_data(), layout={
        'margin': {'t': 0, 'b': 0, 'l': 0, 'r': 0},
        'showlegend': True,
        'legend': {'orientation': "h", 'xanchor': "center", 'x': 0.5, 'y': -0.1},
        'plot_bgcolor': 'rgba(0,0,0,0)',
        'paper_bgcolor': 'rgba(0,0,0,0)',
        'font': {'family': 'Segoe UI', 'size': 12, 'color': '#333'}
    })
    plot(fig2, filename='sales_by_product.html', auto_open=False)

    fig3 = go.Figure(data=generate_donut_country_chart_data(), layout={
        'margin': {'t': 0, 'b': 0, 'l': 0, 'r': 0},
        'showlegend': True,
        'legend': {'orientation': "h", 'xanchor': "center", 'x': 0.5, 'y': -0.1},
        'plot_bgcolor': 'rgba(0,0,0,0)',
        'paper_bgcolor': 'rgba(0,0,0,0)',
        'font': {'family': 'Segoe UI', 'size': 12, 'color': '#333'}
    })
    plot(fig3, filename='sales_by_country_donut.html', auto_open=False)

    fig4 = go.Figure(data=generate_bar_country_chart_data(), layout={
        'xaxis': {'title': 'Sales (M)', 'showgrid': False},
        'yaxis': {'automargin': True},
        'plot_bgcolor': 'rgba(0,0,0,0)',
        'paper_bgcolor': 'rgba(0,0,0,0)',
        'font': {'family': 'Segoe UI', 'size': 12, 'color': '#333'},
        'margin': {'l': 150, 'r': 20, 't': 30, 'b': 50},
        'hovermode': 'closest'
    })
    plot(fig4, filename='sales_by_country_bar.html', auto_open=False)

    print("Generated sales_by_year_month_country.html, sales_by_product.html, sales_by_country_donut.html, and sales_by_country_bar.html")