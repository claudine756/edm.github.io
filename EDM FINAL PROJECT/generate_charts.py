import pandas as pd
import plotly.graph_objects as go

# Load and clean dataset
# Make sure 'top_1000_firms.xlsx - Data.csv' is in the same directory as this script
df = pd.read_csv("top_1000_firms.csv", encoding='ISO-8859-1')
df = df.dropna(subset=['year', 'mnc'])
df['year'] = df['year'].astype(int)
df['mnc'] = df['mnc'].astype(int)

# Get list of unique years
years = sorted(df['year'].unique())

# Define theme colors from your style.css (light mode as default for chart generation)
# These values correspond to the :root variables in your style.css
theme_colors = {
    'primary-navy': '#332D56',
    'content-area-bg': '#E3EEB2', # Used as overall page background, not directly in chart here
    'card-background': '#FFFFFF', # Used as background for chart container
    'text-dark': '#332D56',
    'text-light': '#E3EEB2',
    'harvard-crimson': '#71C0BB',
    'border-color': '#4E6688', # Used for borders
}

# Create figure
fig = go.Figure()

# Add donut for each year
for year in years:
    year_data = df[df['year'] == year]
    counts = year_data['mnc'].value_counts().to_dict()

    domestic = counts.get(0, 0)
    multinational = counts.get(1, 0)
    total = domestic + multinational

    labels = ['Domestic Firms', 'Multinational Firms']
    values = [domestic, multinational]
    hover_text = [
        f"{label}: {val} firms ({(val/total)*100:.1f}%)"
        for label, val in zip(labels, values)
    ]

    fig.add_trace(go.Pie(
        labels=labels,
        values=values,
        hole=0.5,
        name=str(year),
        textinfo='label+percent',
        hoverinfo='text',
        hovertext=hover_text,
        visible=(year == years[0]),
        # Assign colors from your theme for the pie slices
        marker=dict(colors=[theme_colors['primary-navy'], theme_colors['harvard-crimson']])
    ))

# Create dropdown menu
dropdown = [
    dict(
        label=str(year),
        method="update",
        args=[
            {"visible": [i == j for i in range(len(years))]},
            {"title": f"Proportion of Multinational vs. Domestic Firms Among Top 1,000 ({year})",
             "title_font_color": theme_colors['text-dark']} # Apply theme color to dropdown-selected title font
        ]
    )
    for j, year in enumerate(years)
]

# Layout settings with theme colors
fig.update_layout(
    title=f"Proportion of Multinational vs. Domestic Firms Among Top 1,000 ({years[0]})",
    title_font=dict(
        size=20, # Adjust title font size if needed
        color=theme_colors['text-dark'] # Main title font color
    ),
    paper_bgcolor=theme_colors['card-background'], # Background of the entire figure
    plot_bgcolor=theme_colors['card-background'],  # Background of the plotting area
    font=dict(
        family="Segoe UI, Tahoma, Geneva, Verdana, sans-serif", # Match your dashboard font
        color=theme_colors['text-dark']   # Default font color for general chart text (labels, percentages)
    ),
    updatemenus=[
        dict(
            buttons=dropdown,
            direction="down",
            showactive=True,
            x=0.1,
            xanchor="left",
            y=1.2,
            yanchor="top",
            bgcolor=theme_colors['card-background'], # Dropdown background color
            bordercolor=theme_colors['border-color'], # Dropdown border color
            font=dict(color=theme_colors['text-dark']) # Dropdown font color
        )
    ],
    # Margins and dimensions for better fit
    margin=dict(l=40, r=40, b=40, t=100),
    height=400 # Adjust height as needed to fit iframe
)

# Save the chart to an HTML file
# full_html=False means it generates only the <div>, not a full HTML page
# include_plotlyjs='cdn' ensures Plotly.js is loaded from a CDN
# div_id ensures a unique ID for the chart if you embed multiple charts
fig.write_html("mnc_domestic_firms_chart.html", full_html=False, include_plotlyjs='cdn', div_id='mnc-domestic-chart-div')

print("Chart HTML generated successfully as mnc_domestic_firms_chart.html")