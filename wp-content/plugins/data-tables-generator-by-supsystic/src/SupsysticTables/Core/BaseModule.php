<?php


abstract class SupsysticTables_Core_BaseModule extends Rsc_Mvc_Module
{
    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

        $dispathcer = $this->getEnvironment()->getDispatcher();
        $dispathcer->on('after_ui_loaded', array($this, 'afterUiLoaded'));
        $dispathcer->on('after_modules_loaded', array($this, 'afterModulesLoaded'));
    }

    /**
     * Loads the scripts and styles for the current module.
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
        return;
    }

    /**
     * Runs after the all plugin modules are loaded.
     */
    public function afterModulesLoaded()
    {
        return;
    }
}