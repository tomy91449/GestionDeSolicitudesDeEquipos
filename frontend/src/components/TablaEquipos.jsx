import React from 'react';

const TablaEquipos = ({ equipos }) => {

    const obtenerColorEstado = (estado) => {

        switch (estado?.toLowerCase()) {

            case 'disponible':
                return '#2e7d32';

            case 'prestado':
                return '#d32f2f';

            case 'mantenimiento':
                return '#f57c00';

            default:
                return '#616161';
        }
    };

    return (
        <div style={{ overflowX: 'auto' }}>

            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: '#fff'
                }}
            >

                <thead>
                    <tr
                        style={{
                            backgroundColor: '#1f2937',
                            color: 'white'
                        }}
                    >
                        <th style={{ padding: '14px' }}>Código</th>
                        <th style={{ padding: '14px' }}>Nombre</th>
                        <th style={{ padding: '14px' }}>Categoría</th>
                        <th style={{ padding: '14px' }}>Estado</th>
                        <th style={{ padding: '14px' }}>Ubicación</th>
                    </tr>
                </thead>

                <tbody>

                    {equipos.map((equipo) => (

                        <tr key={equipo.id}>

                            <td style={{ padding: '12px' }}>
                                {equipo.codigoInventario}
                            </td>

                            <td style={{ padding: '12px' }}>
                                {equipo.nombre}
                            </td>

                            <td style={{ padding: '12px' }}>
                                {equipo.categoria}
                            </td>

                            <td style={{ padding: '12px' }}>
                                <span
                                    style={{
                                        backgroundColor:
                                            obtenerColorEstado(
                                                equipo.estado
                                            ),
                                        color: 'white',
                                        padding: '5px 10px',
                                        borderRadius: '20px'
                                    }}
                                >
                                    {equipo.estado}
                                </span>
                            </td>

                            <td style={{ padding: '12px' }}>
                                {equipo.ubicacion}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default TablaEquipos;