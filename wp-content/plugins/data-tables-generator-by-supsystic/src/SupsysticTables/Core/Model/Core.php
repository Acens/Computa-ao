<?php


class SupsysticTables_Core_Model_Core extends SupsysticTables_Core_BaseModel
{
    /**
     * Prepares the data before run queries.
     * Replaces the '%prefix%' placeholder to the valid database prefix.
     * @param string $data
     * @return string
     */
    public function prepare($data)
    {
        return str_replace('%prefix%', $this->getPrefix(), $data);
    }

    /**
     * Updates the database.
     * @param string $data
     */
    public function update($data)
    {
        $data = $this->prepare($data);

        if ('alter' === substr(strtolower($data), 0, 5)) {
            $this->db->query($data);

            return;
        }

        $this->delta($data);
    }

    /**
     * Loads updates from the file and update the database.
     * @param string $file Path to updates file.
     */
    public function updateFromFile($file)
    {
        if (!is_readable($file)) {
            throw new RuntimeException(
                sprintf('File "%s" is not readable.', $file)
            );
        }

        if (false === $content = file_get_contents($file)) {
            throw new RuntimeException(
                sprintf('Failed to read file "%s".', $file)
            );
        }

        $this->update($content);
    }
}