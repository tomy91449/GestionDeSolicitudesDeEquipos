import React from 'react';

const Filtros = ({
    filtroNombre,
    setFiltroNombre,
    filtroCategoria,
    setFiltroCategoria
}) => {

    return (
        <div
            style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                flexWrap: 'wrap',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e5e7eb'
            }}
        >

            <input
                type="text"
                placeholder="Buscar equipo..."
                value={filtroNombre}
                onChange={(e) =>
                    setFiltroNombre(e.target.value)
                }
                style={{
                    flex: '1',
                    minWidth: '250px',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                }}
            />

            <select
                value={filtroCategoria}
                onChange={(e) =>
                    setFiltroCategoria(e.target.value)
                }
                style={{
                    minWidth: '180px',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                }}
            >
                <option value="">
                    Todas las categorías
                </option>

                <option value="Notebook">
                    Notebook
                </option>

                <option value="Proyector">
                    Proyector
                </option>

                <option value="Cámara">
                    Cámara
                </option>

                <option value="Tablet">
                    Tablet
                </option>

                <option value="Micrófono">
                    Micrófono
                </option>

            </select>

        </div>
    );
};

export default Filtros;