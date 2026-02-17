# MRI Sim

A rudimentary MRI trade-off simulator designed to demonstrate the "Iron Triangle" of MRI physics: **Signal-to-Noise Ratio (SNR)**, **Spatial Resolution**, and **Scan Time**.

This tool allows students, radiographers, and enthusiasts to visualize how changing acquisition parameters affects image quality, artifacts, and patient scan duration.

## Features

*   **Interactive Controls:** Adjust NEX (Number of Excitations), Matrix (Resolution), and Slice Thickness.
*   **Pulse Sequence Selector:** Choose between common musculoskeletal sequences (UTE, 3D GRE, 3D FSE, PD FSE).
*   **Real-time Visualization:**
    *   **2D Slice Artifacts:** Visualizes noise (grain), pixelation, and partial volume averaging (stair-step artifacts).
    *   **3D Reconstruction:** Simulates how slice thickness impacts 3D model fidelity.
    *   **The Iron Triangle:** Dynamic bar charts showing the trade-off between SNR, Resolution, and Speed.
*   **Radiologist's Impression:** Dynamic feedback warning about diagnostic pitfalls (e.g., motion artifacts from long scans, missed fractures from thick slices).

## Pulse Sequence Timing & Physics References

The simulator uses simplified formulas to approximate scan times and image characteristics. Below are the base values used, derived from standard clinical musculoskeletal protocols.

### Scan Time Approximation
The simulator uses a simplified formula proportional to:
`Time ∝ (Phase Encoding Lines × NEX × TR) / ETL`

*   **Phase Encoding Lines:** Derived from the "Matrix" slider (e.g., 128, 256, 512).
*   **NEX:** Number of Excitations/Averages.
*   **Slices/Partitions:** Penalties are applied for high-resolution 3D acquisitions (thin slices).

### Sequence Parameters
Values are based on typical 1.5T/3T Clinical MSK Protocols:

| Sequence | Full Name | TR (ms) | TE (ms) | ETL | Usage | Reference Logic |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UTE** | Ultrashort TE | 10 | 0.05 | 1 | Cortical bone, Tendon | Radial acquisition allows $TE < 0.1ms$. Very short $TR$ ($10-20ms$) is standard. |
| **3D GRE** | Gradient Echo (SPGR/FLASH) | 20 | 5 | 1 | Cartilage (fast) | Standard T1-weighted 3D GRE uses short $TR$ ($20-50ms$) and low flip angles. |
| **3D FSE** | Fast Spin Echo (SPACE/CUBE) | 1500 | 30 | 60 | 3D Isotropic Vol | High ETL (~40-90) allows long $TR$ ($1500ms+$) to be acquired in reasonable time. |
| **PD FSE** | Proton Density 2D FSE | 3000 | 30 | 12 | Meniscus, Articular Cartilage | Gold standard. Long $TR$ ($2000-4000ms$) for PD weighting. Moderate ETL ($10-15$) to prevent blurring. |

*Note: In reality, 3D FSE sequences often use variable flip angles and very long echo trains to manage SAR and blurring, which this simulator simplifies to a fixed ETL.*

## Deployment

The project includes an `amplify.yml` configuration for easy deployment to **AWS Amplify**.

1.  Push code to your git provider.
2.  Connect repository in AWS Amplify Console.
3.  Deploy.

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`
Builds the app for production to the `build` folder.

